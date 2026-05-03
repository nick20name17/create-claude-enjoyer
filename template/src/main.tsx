import { disableReactDevTools } from '@fvilers/disable-react-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'

import { queryClient } from '@/lib/query-client'
import { createAppRouter } from '@/router'

import '@/index.css'

if (import.meta.env.PROD) disableReactDevTools()

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('#root not found')

const router = createAppRouter({ queryClient })

createRoot(rootEl).render(<RouterProvider router={router} />)
