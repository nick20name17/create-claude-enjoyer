import type { PropsWithChildren } from 'react'

import { TooltipProvider } from '@/components/ui/tooltip'

import { ReactQueryProvider } from './react-query'
import { ThemeProvider } from './theme'

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider>
      <ReactQueryProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  )
}
