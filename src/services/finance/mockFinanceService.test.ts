import { describe, it, expect, beforeEach } from 'vitest';
import { mockFinanceService } from './mockFinanceService';

describe('mockFinanceService', () => {
  it('should return default commission configuration', async () => {
    const config = await mockFinanceService.getCommissionConfig();
    expect(config).toBeDefined();
    expect(config.freeCreatorCommissionPercent).toBe(35);
  });

  it('should initialize a new creator wallet if none exists', async () => {
    const wallet = await mockFinanceService.getCreatorWallet('creator_123');
    expect(wallet.creatorId).toBe('creator_123');
    expect(wallet.availableBalance).toBe(0);
    expect(wallet.totalEarned).toBe(0);
  });

  it('should create an agreement properly', async () => {
    const agreement = await mockFinanceService.createAgreement(
      'title_456',
      'buyer_789',
      'creator_123',
      50000
    );
    expect(agreement.status).toBe('draft');
    expect(agreement.agreedPrice).toBe(50000);
    expect(agreement.buyerId).toBe('buyer_789');
  });

  it('should reject settlement request if insufficient funds', async () => {
    await expect(
      mockFinanceService.requestSettlement('creator_123', 999999)
    ).rejects.toThrow("Insufficient funds");
  });
});
