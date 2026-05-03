import { Alert02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, useRouter } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export const ErrorComponent = ({ error }: { error: Error }) => {
  const router = useRouter()

  return (
    <div className='flex min-h-dvh flex-col items-center justify-center px-4'>
      <div className='flex flex-col items-center gap-2 text-center'>
        <div className='bg-destructive/10 text-destructive mb-2 flex size-16 items-center justify-center rounded-full'>
          <HugeiconsIcon
            icon={Alert02Icon}
            className='size-8'
          />
        </div>

        <h1 className='text-3xl font-bold sm:text-4xl'>Something went wrong</h1>
        <p className='text-muted-foreground max-w-lg text-sm sm:text-base'>
          An unexpected error occurred. Try refreshing the page or return home.
        </p>

        {import.meta.env.DEV && (
          <pre className='bg-muted text-destructive mt-2 w-full max-w-xl overflow-auto rounded-lg p-4 text-left text-xs'>
            {error.message}
          </pre>
        )}

        <div className='mt-4 flex gap-3'>
          <Button
            variant='outline'
            onClick={() => router.invalidate()}
          >
            Try again
          </Button>
          <Button asChild>
            <Link to='/'>Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
