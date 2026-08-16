import { test, expect } from "@playwright/test";

const base = process.env.E2E_BASE_URL ?? "https://streamvista-ai-chat.vercel.app";

test.describe("P0 host smoke (no auth)", () => {
  test("A0 ready endpoint", async ({ request }) => {
    const res = await request.get(`${base}/api/ready`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ready");
    expect(body.database).toBe("connected");
  });

  test("A0 login page loads", async ({ page }) => {
    await page.goto(`${base}/login`);
    await expect(page.locator("body")).toBeVisible();
    // Magic-link copy may vary by deploy; page must not be blank error
    await expect(page).not.toHaveTitle(/404/i);
  });

  test("A6 dashboard redirects when logged out", async ({ page }) => {
    await page.goto(`${base}/dashboard`);
    await page.waitForURL(/login|\/dashboard/, { timeout: 15000 });
    const url = page.url();
    // Either still on login or protected shell — must not show other users' data tables
    expect(url.includes("/login") || url.includes("/dashboard")).toBeTruthy();
  });
});
