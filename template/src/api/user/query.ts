import { queryOptions } from '@tanstack/react-query'

import { userService } from './service'

export const USER_QUERY_KEYS = {
  all: () => ['users'] as const,
  details: () => [...USER_QUERY_KEYS.all(), 'detail'] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id] as const
}

export const getUserQuery = (id: string | null) =>
  queryOptions({
    queryKey: USER_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => {
      if (id === null) throw new Error('id is required')
      return userService.getById(id)
    },
    enabled: id !== null
  })
