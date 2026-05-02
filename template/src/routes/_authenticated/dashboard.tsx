import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({ component: DashboardComponent })

function DashboardComponent() {
  return (
    <div className='p-8'>
      <h1 className='text-3xl font-semibold'>Dashboard</h1>
      <p className='text-muted-foreground mt-2 text-sm'>Цей роут вимагає аутентифікації.</p>
    </div>
  )
}
