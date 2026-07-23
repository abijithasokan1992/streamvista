import { test, expect } from '@playwright/test';

test.describe('Notification System', () => {
  test('notification bell appears with empty state', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    // Register a new creator account
    await page.click('button:has-text("Need an account? Register")');
    await page.fill('input[type="text"]', 'Simple Creator');
    await page.fill('input[type="email"]', 'simplecreator@streamvista.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Register")');
    // Verify navigation away from /register
    await expect(page).not.toHaveURL(/\/register/);
    // Wait for main UI elements
    await expect(page.locator('aside')).toBeVisible({ timeout: 12000 });
    await expect(page.locator('[data-testid="notification-bell"]')).toBeVisible({ timeout: 12000 });
    const bellButton = page.locator('[data-testid="notification-bell"]');
    await expect(bellButton).toBeVisible();
    await bellButton.click();
    await expect(page.locator('text=Notifications')).toBeVisible();
    await expect(page.locator('text=You have no notifications.')).toBeVisible();
  });
});
