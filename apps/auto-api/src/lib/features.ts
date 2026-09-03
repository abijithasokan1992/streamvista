const TRUE_SET = new Set(['1', 'true', 'yes', 'on']);

function toBool(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === '') return fallback;
  return TRUE_SET.has(value.trim().toLowerCase());
}

export function featureFlags() {
  return {
    filmOsWriteEnabled: toBool(process.env.FEATURE_FILM_OS_WRITE_ENABLED, false),
    qcTriggerEnabled: toBool(process.env.FEATURE_QC_TRIGGER_ENABLED, false),
    marketplaceDealEnabled: toBool(process.env.FEATURE_MARKETPLACE_DEAL_ENABLED, true),
  };
}
