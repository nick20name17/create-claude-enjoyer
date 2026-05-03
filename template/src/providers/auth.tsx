import { type UseMutationResult, useMutation } from '@tanstack/react-query'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { type PropsWithChildren, createContext, use, useState } from 'react'

import type { Session, SignInPayload, User } from '@/api/auth/schema'
import { authService } from '@/api/auth/service'
import { clearSession, getSession, setSession } from '@/helpers/auth'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  signInMutation: UseMutationResult<Session, Error, SignInPayload>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate()
  const router = useRouter()
  const [session, setSessionState] = useState<Session | null>(getSession)

  const apply = (next: Session | null) => {
    if (next) setSession(next)
    else clearSession()
    setSessionState(next)
  }

  const signInMutation = useMutation({
    mutationFn: authService.signIn,
    meta: { successMessage: 'Signed in' },
    onSuccess: async next => {
      apply(next)
      await navigate({ to: '/dashboard', replace: true })
      await router.invalidate()
    }
  })

  const logout = async () => {
    apply(null)
    await navigate({ to: '/', replace: true })
    await router.invalidate()
  }

  const value: AuthContextValue = {
    user: session?.user ?? null,
    isAuthenticated: !!session,
    signInMutation,
    logout
  }

  return <AuthContext value={value}>{children}</AuthContext>
}

export const useAuth = (): AuthContextValue => {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
