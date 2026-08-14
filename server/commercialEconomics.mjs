export const DEFAULT_STREAMVISTA_COMMISSION_PERCENT = 35;

function assertMoneyMinor(value, label) {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative integer in minor currency units.`);
  }
}

function assertPercent(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100) {
    throw new RangeError(`${label} must be between 0 and 100.`);
  }
}

export function calculateCommissionSplit(baseMinor, streamvistaCommissionPercent = DEFAULT_STREAMVISTA_COMMISSION_PERCENT) {
  assertMoneyMinor(baseMinor, "baseMinor");
  assertPercent(streamvistaCommissionPercent, "streamvistaCommissionPercent");

  const streamvistaCrayonsMinor = Math.round(baseMinor * (streamvistaCommissionPercent / 100));
  const rightsHolderMinor = baseMinor - streamvistaCrayonsMinor;

  return {
    baseMinor,
    streamvistaCommissionPercent,
    rightsHolderPercent: 100 - streamvistaCommissionPercent,
    streamvistaCrayonsMinor,
    rightsHolderMinor,
  };
}

export function calculateRevenueWaterfall({
  grossMinor,
  approvedDeductionsMinor = 0,
  recoupmentMinor = 0,
  streamvistaCommissionPercent = DEFAULT_STREAMVISTA_COMMISSION_PERCENT,
}) {
  assertMoneyMinor(grossMinor, "grossMinor");
  assertMoneyMinor(approvedDeductionsMinor, "approvedDeductionsMinor");
  assertMoneyMinor(recoupmentMinor, "recoupmentMinor");
  assertPercent(streamvistaCommissionPercent, "streamvistaCommissionPercent");

  if (approvedDeductionsMinor > grossMinor) {
    throw new RangeError("Approved deductions cannot exceed gross revenue.");
  }

  const netReceiptsMinor = grossMinor - approvedDeductionsMinor;
  const appliedRecoupmentMinor = Math.min(recoupmentMinor, netReceiptsMinor);
  const netDistributableMinor = netReceiptsMinor - appliedRecoupmentMinor;
  const split = calculateCommissionSplit(netDistributableMinor, streamvistaCommissionPercent);

  return {
    grossMinor,
    approvedDeductionsMinor,
    netReceiptsMinor,
    requestedRecoupmentMinor: recoupmentMinor,
    appliedRecoupmentMinor,
    unrecoupedBalanceMinor: recoupmentMinor - appliedRecoupmentMinor,
    netDistributableMinor,
    ...split,
  };
}

export function calculateRoiPercent(investmentMinor, returnMinor) {
  assertMoneyMinor(investmentMinor, "investmentMinor");
  assertMoneyMinor(returnMinor, "returnMinor");
  if (investmentMinor === 0) return null;
  return ((returnMinor - investmentMinor) / investmentMinor) * 100;
}
