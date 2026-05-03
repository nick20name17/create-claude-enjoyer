import { expect, test } from './fixtures'

const PUBLIC_ROUTES = ['/', '/about', '/sign-in', '/sign-up']

for (const path of PUBLIC_ROUTES) {
  test(`smoke: ${path} renders without errors`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('body')).not.toBeEmpty()
  })
}
