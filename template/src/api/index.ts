import { AxiosError, type InternalAxiosRequestConfig, create } from 'axios'

import type { Tokens } from '@/api/auth/schema'
import { authService } from '@/api/auth/service'
import { API_BASE_URL, AUTH_REDIRECTS } from '@/constants/api'
import { clearSession, getSession, updateTokens } from '@/helpers/auth'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    retried?: boolean
  }
}

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

const memoizedRefreshToken = () => {
  refreshPromise ??= refreshToken().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

export const api = create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const session = getSession()
  if (session?.access) {
    config.headers.Authorization = `Bearer ${session.access}`
  }
  return config
})

const isAuthRequest = (config: InternalAxiosRequestConfig) => {
  const url = config.url ?? ''
  return url.includes('/auth/') || url.includes('/token/')
}

const forceLogout = () => {
  clearSession()
  window.location.replace(AUTH_REDIRECTS.logout)
}

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const config = error.config

    if (error.response?.status !== 401 || !config || config.retried || isAuthRequest(config)) {
      return Promise.reject(error)
    }

    const session = getSession()
    if (!session?.refresh) {
      forceLogout()
      return Promise.reject(error)
    }

    config.retried = true

    try {
      const { access } = await memoizedRefreshToken()
      config.headers.Authorization = `Bearer ${access}`
      return api(config)
    } catch (refreshError) {
      forceLogout()
      return Promise.reject(refreshError)
    }
  }
)
