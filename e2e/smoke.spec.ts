import { test, expect } from '@playwright/test'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.locator('input[type="email"], input[name="email"]').first().fill('admin@demo.com')
  await page.locator('input[type="password"]').first().fill('admin123')
  await page.getByRole('button', { name: /sign in|login|log in/i }).click()
  await page.waitForURL(/dashboard/, { timeout: 20000 })
}

test('product journey: login → agents → contacts → campaigns → call recording', async ({
  page,
}) => {
  await login(page)

  await page.goto('/agents')
  await expect(page.getByText(/AI Agents|All Agents/i).first()).toBeVisible({ timeout: 15000 })

  await page.goto('/contacts')
  await expect(page.getByText(/Contacts/i).first()).toBeVisible({ timeout: 15000 })

  await page.goto('/campaigns')
  await expect(page.getByText(/Campaigns/i).first()).toBeVisible({ timeout: 15000 })

  await page.goto('/calls/recordings')
  await expect(page.getByText(/Call Recordings|Recordings/i).first()).toBeVisible({
    timeout: 15000,
  })

  const audio = page.locator('audio').first()
  if (await audio.count()) {
    await expect(audio).toHaveAttribute('src', /.+/)
  }
})
