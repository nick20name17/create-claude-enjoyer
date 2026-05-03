import type { PropsWithChildren } from 'react'

import { TooltipProvider } from '@/components/ui/tooltip'

import { AuthProvider } from './auth'
import { ReactQueryProvider } from './react-query'
import { ThemeProvider } from './theme'

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider>
      <ReactQueryProvider>
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  )
}
