import { create } from 'axios'

export const api = create({ baseURL: import.meta.env.VITE_API_URL ?? '/api', timeout: 15000 })
