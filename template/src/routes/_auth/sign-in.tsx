import { zodResolver } from '@hookform/resolvers/zod'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { type SignInPayload, SignInSchema } from '@/api/auth/schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
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
          <CardTitle>Sign in</CardTitle>
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
                label='Password'
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
                {signInMutation.isPending ? <Loader2 className='animate-spin' /> : 'Sign in'}
              </Button>
              <p className='text-muted-foreground text-center text-sm'>
                No account?{' '}
                <Link
                  to='/sign-up'
                  className='underline'
                >
                  Sign up
                </Link>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/_auth/sign-in')({
  component: SignInComponent,
  head: () => ({ meta: [{ title: 'Sign in' }] })
})
