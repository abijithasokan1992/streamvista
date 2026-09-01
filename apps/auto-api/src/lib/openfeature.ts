import { OpenFeature } from '@openfeature/server-sdk';
import { flagsClient } from '@vercel/flags-core';
import { VercelProvider } from '@vercel/flags-core/openfeature';

let initPromise: Promise<void> | null = null;
let initialized = false;
const vercelProvider = new VercelProvider(flagsClient);

async function initialize() {
  try {
    await OpenFeature.setProviderAndWait(vercelProvider);
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize Vercel Flags OpenFeature provider:', error);
    initPromise = null;
    throw error;
  }
}

export async function getOpenFeatureClient() {
  if (initialized) return OpenFeature.getClient();
  if (!initPromise) initPromise = initialize();
  await initPromise;
  return OpenFeature.getClient();
}
