import { api } from '@/api'
import { UserSchema, type User } from './schema'

export const userService = {
  getById: async (id: number): Promise<User> => {
    const { data } = await api.get(`/users/${id}`)
    return UserSchema.parse(data)
  }
}
