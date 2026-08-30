import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export const productionConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  jwtSecret: required('JWT_SECRET'),
  corsOrigins: required('CORS_ORIGINS').split(',').map((v) => v.trim()).filter(Boolean),
  oracle: {
    user: required('ORACLE_DB_USER'),
    password: required('ORACLE_DB_PASSWORD'),
    connectionString: required('ORACLE_DB_CONNECTION_STRING'),
  },
  supabase: {
    url: required('SUPABASE_URL'),
    serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  },
  razorpay: {
    keyId: required('RAZORPAY_KEY_ID'),
    keySecret: required('RAZORPAY_KEY_SECRET'),
    webhookSecret: required('RAZORPAY_WEBHOOK_SECRET'),
  },
  storage: {
    provider: required('STORAGE_PROVIDER'),
  },
  mail: {
    host: required('SMTP_HOST'),
    port: Number(process.env.SMTP_PORT || 465),
    user: required('SMTP_USER'),
    password: required('SMTP_PASSWORD'),
    from: required('MAIL_FROM'),
  },
  ai: {
    openaiApiKey: optional('OPENAI_API_KEY'),
    anthropicApiKey: optional('ANTHROPIC_API_KEY'),
    geminiApiKey: optional('GEMINI_API_KEY'),
  },
  analytics: {
    posthogKey: optional('POSTHOG_API_KEY'),
    posthogHost: optional('POSTHOG_HOST'),
    amplitudeApiKey: optional('AMPLITUDE_API_KEY'),
  },
  render: {
    workerBaseUrl: optional('RENDER_WORKER_BASE_URL'),
    workerToken: optional('RENDER_WORKER_TOKEN'),
  },
};

if (!Number.isInteger(productionConfig.port) || productionConfig.port <= 0 || productionConfig.port > 65535) {
  throw new Error('PORT must be a valid TCP port');
}

if (productionConfig.nodeEnv === 'production' && productionConfig.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production');
}
