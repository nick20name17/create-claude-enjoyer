import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export const PasswordInput = ({ className, ...props }: React.ComponentProps<'input'>) => {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye

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
        aria-label={visible ? 'Hide password' : 'Show password'}
        className='text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-2.5 transition-colors'
      >
        <Icon size={16} />
      </button>
    </div>
  )
}
