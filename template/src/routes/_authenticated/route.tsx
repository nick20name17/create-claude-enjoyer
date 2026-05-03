import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

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
  beforeLoad: () => {
    if (!getSession()) throw redirect({ to: '/sign-in', replace: true })
  }
})
