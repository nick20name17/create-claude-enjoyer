import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export const NotFound = () => {
  return (
    <div className='relative flex min-h-dvh flex-col items-center justify-center px-4'>
      <p className='text-primary/10 pointer-events-none absolute text-[12rem] leading-none font-bold select-none sm:text-[18rem]'>
        404
      </p>

      <div className='relative flex flex-col items-center gap-2 text-center'>
        <h1 className='text-3xl font-bold sm:text-4xl'>Page not found</h1>
        <p className='text-muted-foreground max-w-sm text-sm sm:text-base'>
          This page doesn't exist or has been moved. Check the URL or return home.
        </p>

        <div className='mt-4 flex gap-3'>
          <Button
            variant='outline'
            onClick={() => window.history.back()}
          >
            Back
          </Button>
          <Button asChild>
            <Link to='/'>Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
