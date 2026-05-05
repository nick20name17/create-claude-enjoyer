import { api } from '@/api'
import { UserSchema } from '@/api/user/schema'
import {
  TokensSchema,
  type RefreshPayload,
  type SignInPayload,
  type SignInResponse,
  type SignUpPayload,
  type Tokens
} from './schema'

const mapTokens = (data: unknown): Tokens => {
  const d = data as { access_token?: unknown; refresh_token?: unknown }
  return TokensSchema.parse({ access: d.access_token, refresh: d.refresh_token })
}

export const authService = {
  signIn: async (payload: SignInPayload): Promise<SignInResponse> => {
    const login = await api.post('/auth/login', payload)
    const tokens = mapTokens(login.data)
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
    return mapTokens(data)
  }
}
