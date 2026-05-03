import type { Tokens } from '@/api/auth/schema'
import { authService } from '@/api/auth/service'
import { clearSession, getSession, updateTokens } from '@/helpers/auth'

let refreshPromise: Promise<Tokens> | null = null

const refreshToken = async () => {
  const session = getSession()

  if (!session?.refresh) {
    clearSession()
    throw new Error('No refresh token available')
  }

  try {
    const tokens = await authService.refresh({ refresh: session.refresh })
    if (!tokens.access) {
      clearSession()
      throw new Error('No access token received')
    }
    updateTokens(tokens)
    return tokens
  } catch (error) {
    clearSession()
    throw error
  }
}

export const memoizedRefreshToken = () => {
  refreshPromise ??= refreshToken().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}
