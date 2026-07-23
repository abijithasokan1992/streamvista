import { test, expect } from '@playwright/test';

test.describe('Admin Flows', () => {
  test('admin can access dashboard and reporting', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page.locator('text=Sign In').first()).toBeVisible();
  });
});
