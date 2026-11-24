export type CloudSession = {
  access_token: string
  refresh_token: string
  expires_at?: number
  user: { id: string; email?: string }
}

const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const cloudConfigured = Boolean(url && anonKey)
const SESSION_KEY = 'fs.supabase.session'

export function readSession(): CloudSession | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as CloudSession | null } catch { return null }
}

function saveSession(session: CloudSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

async function authRequest(path: string, body: object) {
  const response = await fetch(`${url}/auth/v1/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', apikey: anonKey! }, body: JSON.stringify(body),
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.msg || payload.message || payload.error_description || 'Supabase authentication failed.')
  return payload
}

export async function signIn(email: string, password: string) {
  const session = await authRequest('token?grant_type=password', { email, password }) as CloudSession & { expires_in?: number }
  if (session.expires_in) session.expires_at = Math.floor(Date.now() / 1000) + session.expires_in
  saveSession(session)
  return session
}

export async function signUp(email: string, password: string) {
  const result = await authRequest('signup', { email, password }) as CloudSession & { expires_in?: number }
  if (!result.access_token) throw new Error('Check your email to confirm your account, then sign in.')
  if (result.expires_in) result.expires_at = Math.floor(Date.now() / 1000) + result.expires_in
  saveSession(result)
  return result
}

export function signOut() { saveSession(null) }

async function validSession() {
  const current = readSession()
  if (!current) throw new Error('Sign in again to sync your progress.')
  if (!current.expires_at || current.expires_at > Date.now() / 1000 + 30) return current
  const renewed = await authRequest('token?grant_type=refresh_token', { refresh_token: current.refresh_token }) as CloudSession & { expires_in?: number }
  if (renewed.expires_in) renewed.expires_at = Math.floor(Date.now() / 1000) + renewed.expires_in
  saveSession(renewed)
  return renewed
}

export async function loadCloudData() {
  const session = await validSession()
  const response = await fetch(`${url}/rest/v1/user_data?select=data&user_id=eq.${encodeURIComponent(session.user.id)}&limit=1`, {
    headers: { apikey: anonKey!, Authorization: `Bearer ${session.access_token}` },
  })
  if (!response.ok) throw new Error('Could not load your cloud data. Check the Supabase table setup.')
  const rows = await response.json() as { data: Record<string, unknown> }[]
  return rows[0]?.data ?? null
}

export async function saveCloudData(data: Record<string, unknown>) {
  const session = await validSession()
  const response = await fetch(`${url}/rest/v1/user_data?on_conflict=user_id`, {
    method: 'POST',
    headers: { apikey: anonKey!, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: session.user.id, data, updated_at: new Date().toISOString() }),
  })
  if (!response.ok) throw new Error('Could not save your cloud data. Check the Supabase table setup.')
}
