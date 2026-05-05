import {
  type UseMutationResult,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { useNavigate, useRouter, useSearch } from '@tanstack/react-router'
import { type PropsWithChildren, createContext, use, useEffect } from 'react'

import type { Session, SignInPayload, SignInResponse, SignUpPayload } from '@/api/auth/schema'
import { authService } from '@/api/auth/service'
import { USER_QUERY_KEYS, getUserQuery } from '@/api/user/query'
import type { User } from '@/api/user/schema'
import { AUTH_REDIRECTS } from '@/constants/api'
import { clearSession, getSession, setSession } from '@/helpers/auth'

const SESSION_QUERY_KEY = ['session'] as const

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isUserLoading: boolean
  signInMutation: UseMutationResult<SignInResponse, Error, SignInPayload>
  signUpMutation: UseMutationResult<User, Error, SignUpPayload>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate()
  const { redirect } = useSearch({ strict: false })

  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: session } = useQuery<Session | null>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => getSession(),
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: getSession
  })

  const userId = session?.user.id ?? null

  const applySession = (next: Session | null) => {
    if (next) setSession(next)
    else clearSession()
    queryClient.setQueryData<Session | null>(SESSION_QUERY_KEY, next)
  }

  const { data: user, isLoading: isUserLoading } = useQuery({
    ...getUserQuery(userId),
    placeholderData: session?.user,
    gcTime: 1000 * 60 * 60 * 24
  })

  const logout = async () => {
    applySession(null)
    await navigate({ to: AUTH_REDIRECTS.logout, replace: true })
    await router.invalidate({ sync: true })
    queryClient.clear()
  }

  useEffect(() => {
    const onForceLogout = async () => {
      clearSession()
      queryClient.setQueryData<Session | null>(SESSION_QUERY_KEY, null)
      await navigate({ to: AUTH_REDIRECTS.logout, replace: true })
      await router.invalidate({ sync: true })
      queryClient.clear()
    }
    const handler = () => {
      void onForceLogout()
    }
    window.addEventListener('auth:force-logout', handler)
    return () => window.removeEventListener('auth:force-logout', handler)
  }, [navigate, router, queryClient])

  const signInMutation = useMutation({
    mutationFn: authService.signIn,
    meta: { successMessage: 'Signed in' },
    onSuccess: async response => {
      applySession(response)

      queryClient.setQueryData(USER_QUERY_KEYS.detail(response.user.id), response.user)
      await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all() })

      const to =
        typeof redirect === 'string' && redirect.startsWith('/')
          ? redirect
          : AUTH_REDIRECTS.signInSuccess

      await navigate({ to, replace: true })
      await router.invalidate({ sync: true })
    }
  })

  const signUpMutation = useMutation({
    mutationFn: authService.signUp,
    meta: { successMessage: 'Account created' },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all() })
      await navigate({ to: AUTH_REDIRECTS.logout, replace: true })
    }
  })

  const value: AuthContextValue = {
    user: user ?? null,
    isAuthenticated: userId !== null,
    isUserLoading,
    signInMutation,
    signUpMutation,
    logout
  }

  return <AuthContext value={value}>{children}</AuthContext>
}

export const useAuth = (): AuthContextValue => {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
