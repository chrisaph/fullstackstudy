import { useEffect, useRef, useState } from 'react'
import { cloudConfigured, loadCloudData, readSession, saveCloudData, signIn, signOut, signUp, type CloudSession } from '../lib/cloud'

function localData() {
  const data: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith('fs.') || key === 'fs.supabase.session') continue
    try { data[key] = JSON.parse(localStorage.getItem(key) || 'null') } catch { /* ignore invalid entries */ }
  }
  return data
}

export default function CloudSync() {
  const [session, setSession] = useState<CloudSession | null>(() => readSession())
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const ignoreUntil = useRef(0)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function restoreAndSync(next: CloudSession) {
    setBusy(true); setStatus('Loading your progress…')
    try {
      const cloud = await loadCloudData()
      if (cloud) {
        ignoreUntil.current = Date.now() + 2000
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (key?.startsWith('fs.') && key !== 'fs.supabase.session') localStorage.removeItem(key)
        }
        for (const [key, value] of Object.entries(cloud)) {
          localStorage.setItem(key, JSON.stringify(value))
          window.dispatchEvent(new CustomEvent('fs:restore', { detail: { key, value } }))
        }
        setStatus(`Synced as ${next.user.email || email}`)
      } else {
        await saveCloudData(localData())
        setStatus('Cloud sync is on. This device’s progress was uploaded.')
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Cloud sync failed.')
    } finally { setBusy(false) }
  }

  useEffect(() => {
    if (session && cloudConfigured) void restoreAndSync(session)
    // Session changes intentionally trigger the initial cloud restore.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id])

  useEffect(() => {
    const changed = (event: Event) => {
      if (!session || Date.now() < ignoreUntil.current) return
      const key = (event as CustomEvent<{ key: string }>).detail?.key
      if (!key?.startsWith('fs.') || key === 'fs.supabase.session') return
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        try { await saveCloudData(localData()); setStatus('All progress synced.') }
        catch (error) { setStatus(error instanceof Error ? error.message : 'Cloud sync failed.') }
      }, 700)
    }
    window.addEventListener('fs:change', changed)
    return () => { window.removeEventListener('fs:change', changed); if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [session])

  async function submit(create: boolean) {
    setBusy(true); setStatus('')
    try {
      const next = create ? await signUp(email, password) : await signIn(email, password)
      setSession(next)
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Could not sign in.') }
    finally { setBusy(false) }
  }

  if (!cloudConfigured) return <div className="mt-3 text-xs text-muted">Cloud sync is ready to configure. Add the Supabase URL and anon key in Netlify environment variables.</div>
  if (session) return <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
    <span>{status || `Signed in as ${session.user.email || 'your account'}`}</span>
    <button className="underline hover:text-ink" onClick={() => { signOut(); setSession(null); setStatus('Signed out. Your browser data is still here.') }}>Sign out</button>
  </div>

  return <div className="mx-auto mt-4 max-w-xl rounded-xl border border-line bg-card p-4 text-left">
    <p className="mb-3 text-sm font-semibold text-ink">Sync your learning progress with Supabase</p>
    <form onSubmit={(event) => { event.preventDefault(); void submit(false) }} className="flex flex-wrap gap-2">
      <input aria-label="Email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="min-w-40 flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm" />
      <input aria-label="Password" type="password" autoComplete="current-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="min-w-36 flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm" />
      <button disabled={busy} className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-50">Sign in</button>
      <button type="button" disabled={busy} onClick={() => void submit(true)} className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink disabled:opacity-50">Create account</button>
    </form>
    {status && <p role="status" className="mt-2 text-xs text-muted">{status}</p>}
  </div>
}
