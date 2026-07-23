export interface CommissionConfig {
  id: string; // usually 'global'
  freeCreatorCommissionPercent: number; // e.g. 35
  storageBillingRatePerGb: number;
  qcServiceFee: number;
  updatedAt: string;
  updatedBy: string; // admin uid
}

export type PaymentStatus = "pending" | "captured" | "failed" | "refunded";
export type SettlementStatus = "pending" | "approved" | "settled";
export type AgreementStatus = "draft" | "signed_by_buyer" | "signed_by_creator" | "executed";

export interface Agreement {
  id: string;
  titleId: string;
  buyerId: string;
  creatorId: string;
  agreedPrice: number;
  currency: string;
  status: AgreementStatus;
  buyerSignatureUrl?: string;
  createdAt: string;
  executedAt?: string;
}

export interface Invoice {
  id: string;
  agreementId: string;
  buyerId: string;
  creatorId: string;
  amount: number;
  platformFee: number;
  taxAmount: number;
  netCreatorEarnings: number;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  pdfUrl?: string;
  createdAt: string;
  paidAt?: string;
}

export interface CreatorWallet {
  creatorId: string; // Document ID
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  lastUpdated: string;
}

export interface PlatformLedgerEntry {
  id: string;
  invoiceId: string;
  type: "revenue" | "payout" | "refund";
  amount: number;
  description: string;
  timestamp: string;
}

export interface SettlementRequest {
  id: string;
  creatorId: string;
  amount: number;
  status: SettlementStatus;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string; // admin uid
  transactionRef?: string;
}
