import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export const NotFound = () => {
  return (
    <div className='relative flex min-h-dvh flex-col items-center justify-center px-4'>
      <p className='text-primary/10 pointer-events-none absolute text-[12rem] leading-none font-bold select-none sm:text-[18rem]'>
        404
      </p>

      <div className='relative flex flex-col items-center gap-2 text-center'>
        <h1 className='text-3xl font-bold sm:text-4xl'>Сторінку не знайдено</h1>
        <p className='text-muted-foreground max-w-sm text-sm sm:text-base'>
          Ця сторінка не існує або була переміщена. Перевірте адресу або поверніться на головну.
        </p>

        <div className='mt-4 flex gap-3'>
          <Button
            variant='outline'
            onClick={() => window.history.back()}
          >
            Назад
          </Button>
          <Button asChild>
            <Link to='/'>На головну</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
