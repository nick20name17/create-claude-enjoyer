import { zodResolver } from '@hookform/resolvers/zod'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { type SignUpPayload, SignUpSchema } from '@/api/auth/schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { useAuth } from '@/providers/auth'

const SignUpComponent = () => {
  const { signUpMutation } = useAuth()

  const form = useForm<SignUpPayload>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { email: '', password: '', name: '' }
  })

  const onSubmit = form.handleSubmit(values => signUpMutation.mutate(values))

  return (
    <div className='flex min-h-dvh items-center justify-center p-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Create an account on the Platzi Fake Store API.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onSubmit}
            noValidate
          >
            <FieldGroup>
              <FormField
                control={form.control}
                name='name'
                label='Name'
              >
                {field => (
                  <Input
                    {...field}
                    autoComplete='name'
                  />
                )}
              </FormField>
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
                    autoComplete='new-password'
                  />
                )}
              </FormField>
              <Button
                type='submit'
                className='w-full'
                disabled={signUpMutation.isPending}
              >
                {signUpMutation.isPending ? <Loader2 className='animate-spin' /> : 'Sign up'}
              </Button>
              <p className='text-muted-foreground text-center text-sm'>
                Have an account?{' '}
                <Link
                  to='/sign-in'
                  className='underline'
                >
                  Sign in
                </Link>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUpComponent,
  head: () => ({ meta: [{ title: 'Sign up' }] })
})
