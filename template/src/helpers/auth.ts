import type { Session } from '@/api/auth/schema'

const KEY = 'session'

export const getSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export const setSession = (session: Session) =>
  localStorage.setItem(KEY, JSON.stringify(session))

export const clearSession = () => localStorage.removeItem(KEY)
