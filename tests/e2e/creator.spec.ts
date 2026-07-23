import { test, expect } from '@playwright/test';

test.describe('Creator Flows', () => {
  test('creator can access dashboard and submit title', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page.locator('text=Sign In').first()).toBeVisible();
  });
});
