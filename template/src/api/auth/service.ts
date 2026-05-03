import type { User } from '../user/schema'
import type { RefreshPayload, SignInPayload, SignInResponse, SignUpPayload, Tokens } from './schema'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const HARDCODED = { email: 'demo@demo.com', password: 'demo1234' }

const makeTokens = (): Tokens => ({
  access: `mock-access-${Date.now()}`,
  refresh: `mock-refresh-${Date.now()}`
})

const DEMO_USER: User = { id: '1', email: HARDCODED.email, name: 'Demo User' }

export const authService = {
  signIn: async ({ email, password }: SignInPayload): Promise<SignInResponse> => {
    await sleep(1000)
    if (email !== HARDCODED.email || password !== HARDCODED.password) {
      throw new Error('Invalid email or password')
    }
    return { ...makeTokens(), user: DEMO_USER }
  },
  signUp: async (payload: SignUpPayload): Promise<User> => {
    await sleep(1000)
    return { id: crypto.randomUUID(), email: payload.email, name: payload.name }
  },
  refresh: async (_payload: RefreshPayload): Promise<Tokens> => {
    await sleep(1000)
    return makeTokens()
  }
}
