import { test as base, expect } from '@playwright/test'

export const test = base.extend<{ consoleGuard: void }>({
  consoleGuard: [
    async ({ page }, provide) => {
      const errors: string[] = []

      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`)
      })
      page.on('pageerror', err => {
        errors.push(`[pageerror] ${err.message}`)
      })

      await provide()

      if (errors.length) {
        throw new Error(`Browser errors detected:\n${errors.join('\n')}`)
      }
    },
    { auto: true }
  ]
})

export { expect }
