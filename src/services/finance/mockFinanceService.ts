import { 
  CommissionConfig, 
  CreatorWallet, 
  Agreement, 
  Invoice, 
  SettlementRequest 
} from "../../types/finance";

// In-memory mock state for the finance engine
let mockCommissionConfig: CommissionConfig = {
  id: "global",
  freeCreatorCommissionPercent: 35,
  storageBillingRatePerGb: 0.05,
  qcServiceFee: 150.00,
  updatedAt: new Date().toISOString(),
  updatedBy: "admin-mock-user"
};

let mockWallets: CreatorWallet[] = [];
let mockAgreements: Agreement[] = [];
let mockInvoices: Invoice[] = [];
let mockSettlements: SettlementRequest[] = [];

export const mockFinanceService = {
  // Configuration
  async getCommissionConfig(): Promise<CommissionConfig> {
    await new Promise(r => setTimeout(r, 400));
    return { ...mockCommissionConfig };
  },

  async updateCommissionConfig(config: Partial<CommissionConfig>, adminId: string): Promise<CommissionConfig> {
    await new Promise(r => setTimeout(r, 600));
    mockCommissionConfig = {
      ...mockCommissionConfig,
      ...config,
      updatedAt: new Date().toISOString(),
      updatedBy: adminId
    };
    return { ...mockCommissionConfig };
  },

  // Wallets
  async getCreatorWallet(creatorId: string): Promise<CreatorWallet> {
    await new Promise(r => setTimeout(r, 300));
    let wallet = mockWallets.find(w => w.creatorId === creatorId);
    if (!wallet) {
      wallet = {
        creatorId,
        availableBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        lastUpdated: new Date().toISOString()
      };
      mockWallets.push(wallet);
    }
    return { ...wallet };
  },

  // Agreements & Money Pipeline
  async createAgreement(titleId: string, buyerId: string, creatorId: string, agreedPrice: number): Promise<Agreement> {
    await new Promise(r => setTimeout(r, 500));
    const agreement: Agreement = {
      id: `agr_${Date.now()}`,
      titleId,
      buyerId,
      creatorId,
      agreedPrice,
      currency: "INR",
      status: "draft",
      createdAt: new Date().toISOString()
    };
    mockAgreements.push(agreement);
    return { ...agreement };
  },

  async getAgreements(userId: string, role: string): Promise<Agreement[]> {
    await new Promise(r => setTimeout(r, 400));
    if (role === "admin" || role === "super_admin" || role === "platform_owner") {
      return [...mockAgreements];
    }
    return mockAgreements.filter(a => a.buyerId === userId || a.creatorId === userId);
  },

  // Settlements
  async requestSettlement(creatorId: string, amount: number): Promise<SettlementRequest> {
    await new Promise(r => setTimeout(r, 800));
    const wallet = mockWallets.find(w => w.creatorId === creatorId);
    if (!wallet || wallet.availableBalance < amount) {
      throw new Error("Insufficient funds");
    }
    
    // Deduct immediately in mock state to prevent double spend
    wallet.availableBalance -= amount;
    
    const request: SettlementRequest = {
      id: `stl_${Date.now()}`,
      creatorId,
      amount,
      status: "pending",
      requestedAt: new Date().toISOString()
    };
    mockSettlements.push(request);
    return { ...request };
  }
};
