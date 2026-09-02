const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
};

export function assertProductionRuntime() {
  required('JWT_SECRET');
  required('SUPABASE_URL');
  required('SUPABASE_SERVICE_ROLE_KEY');
}

export function providerAvailability() {
  return {
    gemini: Boolean(process.env.GEMINI_API_KEY),
    razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    razorpayWebhook: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
    storage: Boolean(process.env.STORAGE_PROVIDER && (process.env.OCI_BUCKET_NAME || process.env.S3_BUCKET_NAME || process.env.GCS_BUCKET_NAME)),
    posthog: Boolean(process.env.POSTHOG_API_KEY),
    amplitude: Boolean(process.env.AMPLITUDE_API_KEY),
    hostingerWebhookSecret: Boolean(process.env.HOSTINGER_WEBHOOK_SECRET),
  };
}
