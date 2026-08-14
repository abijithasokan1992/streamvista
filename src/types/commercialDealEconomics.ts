export const DEFAULT_STREAMVISTA_COMMISSION_PERCENT = 35 as const;
export const DEFAULT_RIGHTS_HOLDER_SHARE_PERCENT = 65 as const;

export const EXPLOITATION_MODELS = [
  "svod",
  "avod",
  "tvod_rental",
  "est_purchase",
  "fast",
  "fvod",
  "pay_tv",
  "free_tv",
  "satellite_tv",
  "cable_tv",
  "iptv",
  "catch_up_tv",
  "theatrical",
  "non_theatrical",
  "inflight",
  "hospitality",
  "institutional",
  "educational",
  "mobile_telco",
  "physical_home_video",
  "digital_download",
  "promotional_clip",
  "other",
] as const;
export type ExploitationModel = (typeof EXPLOITATION_MODELS)[number];

export const COMMERCIAL_MODELS = [
  "fixed_license_fee",
  "minimum_guarantee",
  "mg_plus_revenue_share",
  "revenue_share",
  "outright_assignment",
  "distribution_commission",
  "syndication_commission",
  "transaction_commission",
  "service_fee",
  "subscription_plan",
  "acquisition_fee",
  "cost_plus",
  "hybrid",
  "custom",
] as const;
export type CommercialModel = (typeof COMMERCIAL_MODELS)[number];

export const RIGHTS_CATEGORIES = [
  "linear",
  "non_linear",
  "ancillary",
  "theatrical",
  "non_theatrical",
] as const;
export type RightsCategory = (typeof RIGHTS_CATEGORIES)[number];

export const EXCLUSIVITY_TYPES = [
  "exclusive",
  "non_exclusive",
  "shared",
  "first_window",
  "second_window",
  "holdback",
  "unknown",
] as const;
export type ExclusivityType = (typeof EXCLUSIVITY_TYPES)[number];

export const PAYMENT_BASES = [
  "license_fee",
  "minimum_guarantee",
  "gross_billed",
  "gross_collected",
  "net_receipts",
  "net_distributable_revenue",
  "advertising_revenue",
  "transaction_revenue",
  "subscription_allocation",
  "package_allocation",
  "flat_service_fee",
  "custom",
] as const;
export type PaymentBasis = (typeof PAYMENT_BASES)[number];

export const DEDUCTION_TYPES = [
  "tax",
  "withholding_tax",
  "gst",
  "refund",
  "chargeback",
  "platform_fee",
  "payment_gateway_fee",
  "sales_agent_fee",
  "localization_cost",
  "delivery_cost",
  "marketing_cost",
  "approved_third_party_cost",
  "recoupment",
  "other_contract_approved_cost",
] as const;
export type DeductionType = (typeof DEDUCTION_TYPES)[number];

export const REPORTING_SOURCES = [
  "platform_api",
  "platform_dashboard_export",
  "csv_xlsx",
  "sftp_feed",
  "email_statement",
  "pdf_statement",
  "payment_gateway",
  "bank_receipt",
  "tax_document",
  "manual_verified_entry",
  "authorised_public_collection",
] as const;
export type ReportingSource = (typeof REPORTING_SOURCES)[number];

export type DealScope = {
  rightsCategories: RightsCategory[];
  rightsTypes: string[];
  exploitationModels: ExploitationModel[];
  territories: string[];
  languages: string[];
  exclusivity: ExclusivityType;
  startDate?: string;
  endDate?: string;
  windows?: string[];
  holdbacks?: string[];
  sublicensingAllowed: boolean;
  syndicationAllowed: boolean;
  distributionAllowed: boolean;
  localizationAllowed: boolean;
};

export type RevenueParticipant = {
  partyId: string;
  label: string;
  sharePercent: number;
  role: "streamvista_crayons" | "rights_holder" | "producer" | "distributor" | "syndicator" | "sales_agent" | "partner" | "other";
};

export type CommercialTerms = {
  model: CommercialModel;
  currency: string;
  paymentBasis: PaymentBasis;
  fixedAmountMinor?: number;
  minimumGuaranteeMinor?: number;
  commissionPercent?: number;
  recoupableAmountMinor?: number;
  revenueParticipants?: RevenueParticipant[];
  allowedDeductions: DeductionType[];
  paymentSchedule?: string;
  reportingFrequency?: "per_transaction" | "monthly" | "quarterly" | "half_yearly" | "yearly" | "milestone" | "custom";
  reportingSources: ReportingSource[];
  customTerms?: Record<string, unknown>;
};

export type CommercialDeal = {
  id: string;
  titleId: string;
  buyerPartyId?: string;
  rightsHolderPartyId: string;
  representedByPartyId?: string;
  scope: DealScope;
  terms: CommercialTerms;
  contractEvidenceId?: string;
  status: "draft" | "negotiating" | "approved" | "executed" | "active" | "expired" | "terminated" | "settled";
};

export type CommissionSplit = {
  streamvistaCrayonsPercent: number;
  rightsHolderPercent: number;
};

export function getDefaultCommissionSplit(): CommissionSplit {
  return {
    streamvistaCrayonsPercent: DEFAULT_STREAMVISTA_COMMISSION_PERCENT,
    rightsHolderPercent: DEFAULT_RIGHTS_HOLDER_SHARE_PERCENT,
  };
}

export function validateRevenueParticipants(participants: RevenueParticipant[]): boolean {
  if (participants.length === 0) return false;
  const total = participants.reduce((sum, participant) => sum + participant.sharePercent, 0);
  return participants.every((participant) => participant.sharePercent >= 0 && participant.sharePercent <= 100)
    && Math.abs(total - 100) < 0.000001;
}
