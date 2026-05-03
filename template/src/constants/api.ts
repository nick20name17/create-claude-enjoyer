import { env } from '@/env'
import type { FileRoutesByTo } from '@/routeTree.gen'

export const API_BASE_URL = env.VITE_API_URL

export const AUTH_REDIRECTS = { signInSuccess: '/dashboard', logout: '/sign-in' } satisfies Record<
  string,
  keyof FileRoutesByTo
>
