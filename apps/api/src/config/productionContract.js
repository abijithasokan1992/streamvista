"use strict";

/**
 * Crayons Pictures production contract.
 *
 * Production must fail closed rather than silently switching to mock data,
 * local memory, fallback credentials, or a second application database.
 */

const REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "JWT_SECRET",
];

const OPTIONAL_INTEGRATIONS = [
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "HOSTINGER_SMTP_HOST",
  "HOSTINGER_SMTP_USER",
  "HOSTINGER_SMTP_PASSWORD",
  "AMPLITUDE_API_KEY",
  "POSTHOG_API_KEY",
  "POSTHOG_HOST",
  "AI_GATEWAY_API_KEY",
  "GEMINI_API_KEY",
  "OPENAI_API_KEY",
];

function isProduction() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

function assertProductionContract() {
  if (!isProduction()) return { production: false, missing: [] };

  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`PRODUCTION_CONTRACT_FAILED: missing ${missing.join(", ")}`);
  }

  return {
    production: true,
    missing: [],
    configuredIntegrations: OPTIONAL_INTEGRATIONS.filter((key) => Boolean(process.env[key])),
  };
}

module.exports = { assertProductionContract, isProduction, REQUIRED_ENV, OPTIONAL_INTEGRATIONS };
