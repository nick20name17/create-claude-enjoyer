import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import * as z from 'zod/mini'

import { AUTH_REDIRECTS } from '@/constants/api'
import { getSession } from '@/helpers/auth'

const searchSchema = z.object({ redirect: z.optional(z.string()) })

export const Route = createFileRoute('/_auth')({
  component: () => <Outlet />,
  validateSearch: searchSchema,
  beforeLoad: () => {
    if (getSession()) throw redirect({ to: AUTH_REDIRECTS.signInSuccess, replace: true })
  }
})
