import type { FileRoutesByTo } from '@/routeTree.gen'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export const AUTH_REDIRECTS = { signInSuccess: '/dashboard', logout: '/sign-in' } satisfies Record<
  string,
  keyof FileRoutesByTo
>
