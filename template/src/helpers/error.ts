import { isAxiosError, type AxiosError } from 'axios'

const FALLBACK_ERROR_MESSAGE = 'Щось пішло не так'

const fromAxios = (error: AxiosError): string => {
  const data = error.response?.data
  if (typeof data === 'string') return data
  if (data && typeof data === 'object') {
    const { message, error: err } = data as { message?: unknown; error?: unknown }
    if (typeof message === 'string') return message
    if (typeof err === 'string') return err
  }
  return error.message
}

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) return fromAxios(error)
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return FALLBACK_ERROR_MESSAGE
}
