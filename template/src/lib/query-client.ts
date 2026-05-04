import { MutationCache, QueryClient, type QueryKey } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getErrorMessage } from '@/helpers/error'

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: { suppressErrorToast?: boolean }
    mutationMeta: { invalidatesQuery?: QueryKey; successMessage?: string; errorMessage?: string }
  }
}

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError(error, _, __, mutation) {
      const errorMessage = getErrorMessage(error)
      toast.error(mutation.meta?.errorMessage ?? errorMessage)
    },
    onSuccess(_, __, ___, mutation) {
      const message = mutation.meta?.successMessage
      if (message) toast.success(message)
    },
    onSettled(_, __, ___, ____, mutation): Promise<void> | undefined {
      const queryKey = mutation.options.meta?.invalidatesQuery
      if (queryKey) return queryClient.invalidateQueries({ queryKey })
      return undefined
    }
  }),
  defaultOptions: {
    queries: { retry: 0, staleTime: 1000 * 60 * 10, gcTime: 1000 * 60 * 30 },
    mutations: { retry: 0 }
  }
})
