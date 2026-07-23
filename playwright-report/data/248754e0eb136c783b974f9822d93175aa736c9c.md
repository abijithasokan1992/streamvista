# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notification_simple.spec.ts >> Notification System >> notification bell appears with empty state
- Location: tests\e2e\notification_simple.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button:has-text("New Title")')
Expected: visible
Timeout: 12000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 12000ms
  - waiting for locator('button:has-text("New Title")')

```

```yaml
- text: StreamVista
- heading "Create Account" [level=3]
- paragraph: Register for a new StreamVista buyer account.
- text: Display Name
- textbox: Simple Creator
- text: Email address
- textbox: simplecreator@streamvista.com
- text: Password
- textbox: password
- button "Register"
- button "Already have an account? Sign in"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Notification System', () => {
  4  |   test('notification bell appears with empty state', async ({ page }) => {
  5  |     await page.goto('http://localhost:5173/login');
  6  |     // Register a new creator account
  7  |     await page.click('button:has-text("Need an account? Register")');
  8  |     await page.fill('input[type="text"]', 'Simple Creator');
  9  |     await page.fill('input[type="email"]', 'simplecreator@streamvista.com');
  10 |     await page.fill('input[type="password"]', 'password');
  11 |     await page.click('button:has-text("Register")');
  12 |     // Wait for dashboard
> 13 |     await expect(page.locator('button:has-text("New Title")')).toBeVisible({ timeout: 12000 });
     |                                                                ^ Error: expect(locator).toBeVisible() failed
  14 |     const bellButton = page.locator('button').filter({ has: page.locator('svg.lucide-bell') });
  15 |     await expect(bellButton).toBeVisible();
  16 |     await bellButton.click();
  17 |     await expect(page.locator('text=Notifications')).toBeVisible();
  18 |     await expect(page.locator('text=You have no notifications.')).toBeVisible();
  19 |   });
  20 | });
  21 | 
```