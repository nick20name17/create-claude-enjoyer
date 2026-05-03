import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { AUTH_REDIRECTS } from '@/constants/api'
import { getSession } from '@/helpers/auth'

const AuthenticatedLayout = () => {
  return (
    <main className='flex min-h-dvh flex-col'>
      <Outlet />
    </main>
  )
}

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
  beforeLoad: ({ location }) => {
    if (!getSession()) {
      throw redirect({
        to: AUTH_REDIRECTS.logout,
        search: { redirect: location.href },
        replace: true
      })
    }
  }
})
