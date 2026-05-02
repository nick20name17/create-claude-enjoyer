import type { PropsWithChildren } from 'react'

import { TooltipProvider } from '@/components/ui/tooltip'

import { ReactQueryProvider } from './react-query'

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ReactQueryProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </ReactQueryProvider>
  )
}
