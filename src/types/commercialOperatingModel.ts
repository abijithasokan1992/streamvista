export const COMMERCIAL_STAGES = [
  "create",
  "produce",
  "represent",
  "verify",
  "package",
  "market",
  "match",
  "negotiate",
  "license",
  "syndicate",
  "distribute",
  "deliver",
  "monetise",
  "settle",
] as const;

export type CommercialStage = (typeof COMMERCIAL_STAGES)[number];

export const COMMERCIAL_PERSONAS = [
  "creator",
  "filmmaker",
  "producer",
  "studio",
  "rights_holder",
  "licensor",
  "sales_agent",
  "representative",
  "distributor",
  "syndicator",
  "aggregator",
  "buyer",
  "ott_platform",
  "fast_platform",
  "broadcaster",
  "iptv_platform",
  "localization_partner",
  "delivery_partner",
] as const;

export type CommercialPersona = (typeof COMMERCIAL_PERSONAS)[number];

export const VERIFICATION_TRACKS = [
  "legal",
  "creative_documentation",
  "technical_delivery",
  "customer_human_scrutiny",
  "audit_evidence",
  "ai_processing",
] as const;

export type VerificationTrack = (typeof VERIFICATION_TRACKS)[number];

export const CHECK_STATUSES = [
  "missing",
  "unverified",
  "pending_human_review",
  "verified",
  "not_applicable",
  "conflict",
  "expired",
  "rejected",
] as const;

export type VerificationCheckStatus = (typeof CHECK_STATUSES)[number];

export type EvidenceReference = {
  id: string;
  kind:
    | "agreement"
    | "mandate"
    | "identity"
    | "email"
    | "database_record"
    | "repository_commit"
    | "asset"
    | "qc_report"
    | "delivery_receipt"
    | "payment_record"
    | "settlement_statement"
    | "ai_report"
    | "other";
  source: string;
  version?: string;
  checksum?: string;
  capturedAt: string;
};

export type HumanReview = {
  id: string;
  reviewerId: string;
  reviewerRole:
    | "rights_holder"
    | "legal"
    | "creative"
    | "technical_qc"
    | "buyer"
    | "finance"
    | "founder"
    | "authorised_approver";
  decision: "approved" | "rejected" | "changes_required";
  reason?: string;
  evidenceIds: string[];
  reviewedAt: string;
};

export type AIProcessingRun = {
  id: string;
  tool: string;
  task:
    | "document_classification"
    | "rights_extraction"
    | "conflict_detection"
    | "expiry_detection"
    | "missing_document_detection"
    | "metadata_normalization"
    | "duplicate_detection"
    | "buyer_requirement_extraction"
    | "title_buyer_matching"
    | "proposal_drafting"
    | "contract_comparison"
    | "qc_summary"
    | "risk_scoring"
    | "reconciliation"
    | "audit_report"
    | "other";
  inputEvidenceIds: string[];
  outputEvidenceId?: string;
  confidence?: number;
  requiresHumanReview: boolean;
  completedAt: string;
};

export type VerificationCheck = {
  id: string;
  stage: CommercialStage;
  track: VerificationTrack;
  code: string;
  label: string;
  required: boolean;
  status: VerificationCheckStatus;
  evidenceIds: string[];
  humanReviewId?: string;
  aiProcessingRunIds?: string[];
  blockingReason?: string;
};

export type RightsGrant = {
  id: string;
  titleId: string;
  rightsHolderPartyId: string;
  representedByPartyId?: string;
  classification: "linear" | "non_linear" | "ancillary";
  rightType: string;
  media: string[];
  territories: string[];
  languages: string[];
  exclusivity: "exclusive" | "non_exclusive" | "shared" | "unknown";
  availableFrom?: string;
  availableUntil?: string;
  holdbacks?: string[];
  canNegotiate: boolean;
  canLicense: boolean;
  canSyndicate: boolean;
  canDistribute: boolean;
  canLocalize: boolean;
  sourceEvidenceIds: string[];
  verificationStatus: VerificationCheckStatus;
};

export type PartyCapability = {
  id: string;
  partyId: string;
  persona: CommercialPersona;
  titleId?: string;
  rightsGrantId?: string;
  agreementEvidenceId?: string;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
};

export type StageGateResult = {
  stage: CommercialStage;
  passed: boolean;
  completedRequired: number;
  totalRequired: number;
  percentComplete: number;
  blockers: VerificationCheck[];
};

const PASSING_STATUSES = new Set<VerificationCheckStatus>(["verified", "not_applicable"]);

export function evaluateStageGate(
  stage: CommercialStage,
  checks: VerificationCheck[],
): StageGateResult {
  const required = checks.filter((check) => check.stage === stage && check.required);
  const completed = required.filter((check) => PASSING_STATUSES.has(check.status));
  const blockers = required.filter((check) => !PASSING_STATUSES.has(check.status));

  return {
    stage,
    passed: required.length > 0 && blockers.length === 0,
    completedRequired: completed.length,
    totalRequired: required.length,
    percentComplete: required.length === 0 ? 0 : Math.round((completed.length / required.length) * 100),
    blockers,
  };
}

export function canPromoteStage(stage: CommercialStage, checks: VerificationCheck[]): boolean {
  return evaluateStageGate(stage, checks).passed;
}
