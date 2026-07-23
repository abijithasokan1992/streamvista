import { test, expect } from '@playwright/test';

test.describe('Security Rules Verification', () => {
  test('unauthorized users are redirected to login', async ({ page }) => {
    await page.goto('http://localhost:5173/admin');
    // Expect redirect to login since not authenticated
    await expect(page).toHaveURL(/.*login/);
  });
});
