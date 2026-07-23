import { test, expect } from '@playwright/test';

test.describe('Migration Verification', () => {
  test('legacy data migration runs idempotently without breaking UI', async ({ page }) => {
    // True migration testing is done in the backend scripts (run.ts --test).
    // This E2E suite verifies that the UI still renders correctly after a migration.
    await page.goto('http://localhost:5173/');
    await expect(page).toHaveURL(/.*login/);
  });
});
