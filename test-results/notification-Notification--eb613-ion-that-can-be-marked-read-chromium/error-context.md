# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notification.spec.ts >> Notification System >> QC approval creates a notification that can be marked read
- Location: tests\e2e\notification.spec.ts:16:3

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
- textbox: Test Creator
- text: Email address
- textbox: creator2@streamvista.com
- text: Password
- textbox: password
- button "Register"
- button "Already have an account? Sign in"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import * as admin from 'firebase-admin';
  3  | import { initializeApp } from 'firebase-admin/app';
  4  | import { getFirestore } from 'firebase-admin/firestore';
  5  | 
  6  | // Initialize firebase admin to connect to emulator
  7  | if (!admin.apps || admin.apps.length === 0) {
  8  |   process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  9  |   process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  10 |   initializeApp({ projectId: 'demo-streamvista' });
  11 | }
  12 | 
  13 | const db = getFirestore();
  14 | 
  15 | test.describe('Notification System', () => {
  16 |   test('QC approval creates a notification that can be marked read', async ({ page }) => {
  17 |     const creatorId = "creator_test_123";
  18 |     
  19 |     // Create a mock user in auth emulator just in case, or just login if not required.
  20 |     // Actually, our app uses useAuth which talks to the auth emulator.
  21 |     // Let's seed the auth emulator via REST, or just use the UI to register!
  22 |     
  23 |     await page.goto('http://localhost:5173/login');
  24 |     
  25 |     // Register as creator
  26 |     await page.click('button:has-text("Need an account? Register")');
  27 |     await page.fill('input[type="text"]', 'Test Creator');
  28 |     await page.fill('input[type="email"]', 'creator2@streamvista.com');
  29 |     await page.fill('input[type="password"]', 'password');
  30 |     await page.click('button:has-text("Register")');
  31 |     
  32 |     // Wait for dashboard to load (New Title button)
> 33 | await expect(page.locator('button:has-text("New Title")')).toBeVisible({ timeout: 12000 });
     |                                                            ^ Error: expect(locator).toBeVisible() failed
  34 |     
  35 |     // We don't know the exact UID since we just registered, but let's grab it if we can.
  36 |     // Or we just insert a notification for ALL users, or we find the user by email via admin SDK.
  37 |     const userRecord = await admin.auth().getUserByEmail('creator2@streamvista.com');
  38 |     const actualUid = userRecord.uid;
  39 |     
  40 |     // Simulate QC Approval which triggers a notification
  41 |     await db.collection('notifications').add({
  42 |       userId: actualUid,
  43 |       title: 'Title Approved',
  44 |       message: 'Your title has been approved by QC.',
  45 |       type: 'qc_approved',
  46 |       read: false,
  47 |       createdAt: admin.firestore.FieldValue.serverTimestamp(),
  48 |       data: { titleId: 'fake_title_123' }
  49 |     });
  50 |     
  51 |     // Check if the bell icon has a badge (1)
  52 |     const bellButton = page.locator('button').filter({ has: page.locator('svg.lucide-bell') });
  53 |     await expect(bellButton).toBeVisible();
  54 |     await expect(bellButton.locator('span.bg-red-500')).toHaveText('1', { timeout: 5000 });
  55 |     
  56 |     // Click the bell
  57 |     await bellButton.click();
  58 |     
  59 |     // Check if notification is there
  60 |     await expect(page.locator('text=Title Approved')).toBeVisible();
  61 |     
  62 |     // Click it to mark as read
  63 |     await page.locator('text=Title Approved').click();
  64 |     
  65 |     // Badge should disappear
  66 |     await expect(bellButton.locator('span.bg-red-500')).toBeHidden();
  67 |   });
  68 | });
  69 | 
```