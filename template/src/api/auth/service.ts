import type { Session, SignInPayload } from './schema'

const HARDCODED = { email: 'demo@demo.com', password: 'demo1234' }

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export const authService = {
  signIn: async ({ email, password }: SignInPayload): Promise<Session> => {
    await sleep(600)
    if (email !== HARDCODED.email || password !== HARDCODED.password) {
      throw new Error('Невірний email або пароль')
    }
    return { user: { id: '1', email, name: 'Demo User' } }
  }
}
