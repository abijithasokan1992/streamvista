const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/login');
  await page.click('button:has-text("Need an account? Register")');
  await page.fill('input[type="text"]', 'Debug Creator');
  await page.fill('input[type="email"]', 'debugcreator@streamvista.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button:has-text("Register")');
  await page.waitForURL('**/buyer', { timeout: 15000 });
  console.log('Current URL:', page.url());
  const html = await page.content();
  console.log('Page content length:', html.length);
  const bell = await page.$('[data-testid="notification-bell"]');
  console.log('Bell present:', !!bell);
  if (bell) {
    const bbox = await bell.boundingBox();
    console.log('Bell boundingBox:', bbox);
  }
  await browser.close();
})();
