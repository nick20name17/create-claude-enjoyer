import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { HeadContent, Link, Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/providers'
import type { RouterContext } from '@/router'

import { ErrorComponent } from './-error'
import { NotFound } from './-not-found'

const RootComponent = () => {
  return (
    <>
      <HeadContent />
      <Providers>
        <div className='flex gap-4 p-4 text-lg'>
          <Link
            to='/'
            activeProps={{ className: 'font-bold' }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
          <Link
            to='/about'
            activeProps={{ className: 'font-bold' }}
          >
            About
          </Link>
          <Link
            to='/sign-in'
            activeProps={{ className: 'font-bold' }}
          >
            Sign in
          </Link>
          <Link
            to='/dashboard'
            activeProps={{ className: 'font-bold' }}
          >
            Dashboard
          </Link>
        </div>
        <hr />
        <Outlet />
        <Toaster
          richColors
          closeButton
          duration={5_000}
        />
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            { name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> },
            { name: 'TanStack Query', render: <ReactQueryDevtoolsPanel /> }
          ]}
        />
      </Providers>
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
  head: () => ({
    meta: [{ title: 'claude-enjoyer' }, { name: 'description', content: 'claude-enjoyer app' }]
  })
})
