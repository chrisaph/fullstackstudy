import { useEffect, useState } from 'react'

export function useLocal<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key)
      return s ? (JSON.parse(s) as T) : init
    } catch {
      return init
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v))
      window.dispatchEvent(new CustomEvent('fs:change', { detail: { key } }))
    } catch { /* storage full or blocked */ }
  }, [key, v])
  useEffect(() => {
    const restore = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; value: unknown }>).detail
      if (detail?.key === key) setV(detail.value as T)
    }
    window.addEventListener('fs:restore', restore)
    return () => window.removeEventListener('fs:restore', restore)
  }, [key])
  return [v, setV] as const
}

export type Note = { id: string; title: string; tag: string; body: string; at: number }
export type Snapshot = { at: number; scores: Record<string, number>; total: number }
export type ProblemState = { status: 'todo' | 'solved' | 'resolved'; at?: number }

export type Style = 'V' | 'A' | 'R' | 'K'
export type LogEvent = { id: string; day: string; ts: number; topic: string; style: Style }
export type Mode = 'cumulative' | 'fresh'
export type Reflection = { learned: string; hard: string; next: string; other?: string }
