import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_STREAMVISTA_COMMISSION_PERCENT,
  calculateCommissionSplit,
  calculateRevenueWaterfall,
  calculateRoiPercent,
} from "./commercialEconomics.mjs";

test("default commercial split is 35 percent StreamVista and 65 percent rights holder", () => {
  assert.equal(DEFAULT_STREAMVISTA_COMMISSION_PERCENT, 35);
  assert.deepEqual(calculateCommissionSplit(100_000), {
    baseMinor: 100_000,
    streamvistaCommissionPercent: 35,
    rightsHolderPercent: 65,
    streamvistaCrayonsMinor: 35_000,
    rightsHolderMinor: 65_000,
  });
});

test("waterfall applies approved deductions and recoupment before commission", () => {
  const result = calculateRevenueWaterfall({
    grossMinor: 100_000,
    approvedDeductionsMinor: 10_000,
    recoupmentMinor: 20_000,
  });
  assert.equal(result.netReceiptsMinor, 90_000);
  assert.equal(result.netDistributableMinor, 70_000);
  assert.equal(result.streamvistaCrayonsMinor, 24_500);
  assert.equal(result.rightsHolderMinor, 45_500);
});

test("deal-specific commission can override the 35 percent default", () => {
  const result = calculateCommissionSplit(100_000, 20);
  assert.equal(result.streamvistaCrayonsMinor, 20_000);
  assert.equal(result.rightsHolderMinor, 80_000);
});

test("ROI reports return over investment and handles zero investment", () => {
  assert.equal(calculateRoiPercent(100_000, 150_000), 50);
  assert.equal(calculateRoiPercent(0, 150_000), null);
});

test("invalid financial inputs fail closed", () => {
  assert.throws(() => calculateCommissionSplit(100_000, 101), /between 0 and 100/);
  assert.throws(
    () => calculateRevenueWaterfall({ grossMinor: 100_000, approvedDeductionsMinor: 110_000 }),
    /cannot exceed gross revenue/,
  );
});
