import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export const PasswordInput = ({ className, ...props }: React.ComponentProps<'input'>) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className='relative'>
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        placeholder={props.placeholder ?? '••••••••'}
        className={cn('pr-9', className)}
      />
      <button
        type='button'
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Сховати пароль' : 'Показати пароль'}
        className='absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground transition-colors hover:text-foreground'
      >
        <HugeiconsIcon
          icon={visible ? ViewOffIcon : ViewIcon}
          size={16}
        />
      </button>
    </div>
  )
}
