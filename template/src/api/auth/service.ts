import * as z from 'zod/mini'

import { api } from '@/api'
import { UserSchema } from '@/api/user/schema'
import type {
  RefreshPayload,
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  Tokens
} from './schema'

const TokensWireSchema = z.object({ access_token: z.string(), refresh_token: z.string() })

const parseTokens = (data: unknown): Tokens => {
  const wire = TokensWireSchema.parse(data)
  return { access: wire.access_token, refresh: wire.refresh_token }
}

export const authService = {
  signIn: async (payload: SignInPayload): Promise<SignInResponse> => {
    const login = await api.post('/auth/login', payload)
    const tokens = parseTokens(login.data)
    const profile = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${tokens.access}` }
    })
    const user = UserSchema.parse(profile.data)
    return { ...tokens, user }
  },
  signUp: async (payload: SignUpPayload) => {
    const body = {
      ...payload,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(payload.email)}`
    }
    const { data } = await api.post('/users/', body)
    return UserSchema.parse(data)
  },
  refresh: async (payload: RefreshPayload): Promise<Tokens> => {
    const { data } = await api.post('/auth/refresh-token', { refreshToken: payload.refresh })
    return parseTokens(data)
  }
}
