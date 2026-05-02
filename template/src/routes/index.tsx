import { createFileRoute } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: HomeComponent })

function HomeComponent() {
  return (
    <div className='flex flex-col items-center gap-4 p-8'>
      <h1 className='text-3xl font-semibold'>Welcome Home</h1>
      <p className='text-muted-foreground'>
        Edit <code className='bg-muted rounded px-1.5 py-0.5'>src/routes/index.tsx</code> to get
        started
      </p>
      <Button>Click me</Button>
    </div>
  )
}
