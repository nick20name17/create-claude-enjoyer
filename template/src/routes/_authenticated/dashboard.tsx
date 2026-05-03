import { createFileRoute } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth'

export const Route = createFileRoute('/_authenticated/dashboard')({ component: DashboardComponent })

function DashboardComponent() {
  const { user, logout } = useAuth()

  return (
    <div className='p-8'>
      <h1 className='text-3xl font-semibold'>Dashboard</h1>
      <p className='text-muted-foreground mt-2 text-sm'>
        Hi, <span className='font-medium text-foreground'>{user?.name}</span> ({user?.email})
      </p>
      <Button
        className='mt-4'
        variant='outline'
        onClick={logout}
      >
        Sign out
      </Button>
    </div>
  )
}
