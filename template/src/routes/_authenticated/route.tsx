import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

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
    // TODO: підставити реальну перевірку сесії
    const isAuthenticated = false

    if (!isAuthenticated) {
      throw redirect({
        to: '/',
        replace: true,
        search: prev => ({ ...prev, redirect: location.href })
      })
    }
  }
})
