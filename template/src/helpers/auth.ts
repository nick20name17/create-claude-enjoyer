import { SessionSchema, type Session, type Tokens } from '@/api/auth/schema'
import { clearAllFormDrafts } from '@/helpers/form-drafts'

const KEY = 'session'

export const getSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? SessionSchema.parse(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export const setSession = (session: Session) => localStorage.setItem(KEY, JSON.stringify(session))

export const clearSession = () => {
  localStorage.removeItem(KEY)
  clearAllFormDrafts()
}

export const updateTokens = (tokens: Tokens) => {
  const session = getSession()
  if (session) setSession({ ...session, ...tokens })
}
