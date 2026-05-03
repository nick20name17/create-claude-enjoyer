import { AxiosError, type InternalAxiosRequestConfig, create } from 'axios'

import { API_BASE_URL, AUTH_REDIRECTS } from '@/constants/api'
import { clearSession, getSession } from '@/helpers/auth'

import { memoizedRefreshToken } from './helpers'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    retried?: boolean
  }
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
