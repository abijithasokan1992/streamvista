import { defineConfig } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "https://streamvista-ai-chat.vercel.app";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { channel: "chromium" } }],
});
