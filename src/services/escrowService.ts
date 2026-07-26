/**
 * Financial Waterfall & B2B Escrow Lock Engine
 * StreamVista Cloud X / Crayons Bridge - RD 360
 * Founder & CEO: Abijith Asokan
 */

export type EscrowStatus = "pending" | "locked" | "disbursed" | "cancelled";
export type SplitModel = "standard_10_90" | "jv_equity_50_50";

export interface EscrowDeal {
  dealId: string;
  titleId: string;
  titleName: string;
  buyerName: string;
  buyerEmail: string;
  grossAmountUSD: number;
  splitModel: SplitModel;
  platformFeeUSD: number;
  producerPayoutUSD: number;
  status: EscrowStatus;
  createdAt: string;
  lockedAt?: string;
  disbursedAt?: string;
}

class EscrowService {
  private deals: Map<string, EscrowDeal> = new Map();

  constructor() {
    // Initial mock deal for Jananam 1947
    this.createDeal({
      dealId: "deal_jananam_1947",
      titleId: "jananam-1947",
      titleName: "Jananam 1947 Pranayam Thudarunnu",
      buyerName: "Amazon Prime Video Licensing",
      buyerEmail: "licensing@amazon.com",
      grossAmountUSD: 35000,
      splitModel: "standard_10_90"
    });
  }

  createDeal(params: {
    dealId: string;
    titleId: string;
    titleName: string;
    buyerName: string;
    buyerEmail: string;
    grossAmountUSD: number;
    splitModel: SplitModel;
  }): EscrowDeal {
    const isStandard = params.splitModel === "standard_10_90";
    const platformFeeUSD = isStandard 
      ? params.grossAmountUSD * 0.10  // 10% Platform Fee
      : params.grossAmountUSD * 0.50; // 50% JV Split

    const producerPayoutUSD = params.grossAmountUSD - platformFeeUSD;

    const deal: EscrowDeal = {
      ...params,
      platformFeeUSD,
      producerPayoutUSD,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    this.deals.set(deal.dealId, deal);
    return deal;
  }

  lockEscrow(dealId: string): EscrowDeal {
    const deal = this.deals.get(dealId);
    if (!deal) throw new Error(`Deal ${dealId} not found`);
    
    deal.status = "locked";
    deal.lockedAt = new Date().toISOString();
    return deal;
  }

  disburseEscrow(dealId: string): EscrowDeal {
    const deal = this.deals.get(dealId);
    if (!deal) throw new Error(`Deal ${dealId} not found`);
    if (deal.status !== "locked") throw new Error("Escrow must be locked before disbursement");

    deal.status = "disbursed";
    deal.disbursedAt = new Date().toISOString();
    return deal;
  }

  getDeal(dealId: string): EscrowDeal | undefined {
    return this.deals.get(dealId);
  }
}

export const escrowService = new EscrowService();
