import type { User } from './schema'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export const userService = {
  getById: async (id: string): Promise<User> => {
    await sleep(1000)
    return { id, email: 'demo@demo.com', name: 'Demo User' }
  }
}
