import { zodResolver } from '@hookform/resolvers/zod'
import { Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { type SignInPayload, SignInSchema } from '@/api/auth/schema'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { getSession } from '@/helpers/auth'
import { useAuth } from '@/providers/auth'

const SignInComponent = () => {
  const { signInMutation } = useAuth()

  const form = useForm<SignInPayload>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = form.handleSubmit(values => signInMutation.mutate(values))

  return (
    <div className='flex min-h-dvh items-center justify-center p-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle>Вхід</CardTitle>
          <CardDescription>
            demo: <code>demo@demo.com</code> / <code>demo1234</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onSubmit}
            noValidate
          >
            <FieldGroup>
              <FormField
                control={form.control}
                name='email'
                label='Email'
              >
                {field => (
                  <Input
                    {...field}
                    type='email'
                    placeholder='you@example.com'
                    autoComplete='email'
                  />
                )}
              </FormField>
              <FormField
                control={form.control}
                name='password'
                label='Пароль'
              >
                {field => (
                  <PasswordInput
                    {...field}
                    autoComplete='current-password'
                  />
                )}
              </FormField>
              <Button
                type='submit'
                className='w-full'
                disabled={signInMutation.isPending}
              >
                {signInMutation.isPending ? (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    className='animate-spin'
                  />
                ) : (
                  'Увійти'
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/sign-in')({
  component: SignInComponent,
  beforeLoad: () => {
    if (getSession()) throw redirect({ to: '/dashboard', replace: true })
  },
  head: () => ({ meta: [{ title: 'Вхід' }] })
})
