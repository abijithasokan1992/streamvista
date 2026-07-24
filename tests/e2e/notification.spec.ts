import { test, expect } from '@playwright/test';
import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize firebase admin to connect to emulator
if (!admin.apps || admin.apps.length === 0) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  initializeApp({ projectId: 'demo-streamvista' });
}

const db = getFirestore();

test.describe('Notification System', () => {
  test('QC approval creates a notification that can be marked read', async ({ page }) => {
    const creatorId = "creator_test_123";
    
    // Create a mock user in auth emulator just in case, or just login if not required.
    // Actually, our app uses useAuth which talks to the auth emulator.
    // Let's seed the auth emulator via REST, or just use the UI to register!
    
    await page.goto('http://localhost:5173/login');
    
    // Register as creator
    await page.click('button:has-text("Need an account? Register")');
    await page.fill('input[type="text"]', 'Test Creator');
    await page.fill('input[type="email"]', 'creator2@streamvista.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Register")');
    
    // Verify navigation away from /register
    await expect(page).not.toHaveURL(/\/register/);
    // Wait for main UI elements
    await expect(page.locator('aside')).toBeVisible({ timeout: 12000 });
    await expect(page.locator('[data-testid="notification-bell"]')).toBeVisible({ timeout: 12000 });
    const bellButton = page.locator('[data-testid="notification-bell"]');
    
    // We don't know the exact UID since we just registered, but let's grab it if we can.
    // Or we just insert a notification for ALL users, or we find the user by email via admin SDK.
    const userRecord = await admin.auth().getUserByEmail('creator2@streamvista.com');
    const actualUid = userRecord.uid;
    
    // Simulate QC Approval which triggers a notification
    await db.collection('notifications').add({
      userId: actualUid,
      title: 'Title Approved',
      message: 'Your title has been approved by QC.',
      type: 'qc_approved',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      data: { titleId: 'fake_title_123' }
    });
    
    // Use the previously defined bellButton with test-id
    // const bellButton = page.locator('button').filter({ has: page.locator('svg.lucide-bell') });
    await expect(bellButton).toBeVisible();
    await expect(bellButton.locator('[data-testid="notification-count"]')).toHaveText('1', { timeout: 5000 });
    
    // Click the bell
    await bellButton.click();
    
    // Check if notification is there
    await expect(page.locator('text=Title Approved')).toBeVisible();
    
    // Click it to mark as read
    await page.locator('text=Title Approved').click();
    
    // Badge should disappear
    await expect(bellButton.locator('[data-testid="notification-count"]').toBeHidden();
  });
});
