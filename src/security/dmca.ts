export type RightsClaimStatus = "declared" | "verified" | "disputed" | "takedown_requested" | "removed";

export interface RightsEvidence {
  evidenceId: string;
  titleId: string;
  ownerUserId: string;
  territory: string;
  rightsType: string;
  sourceReference: string;
  checksum?: string;
  createdAt: string;
}

export interface DmcaCase {
  caseId: string;
  titleId: string;
  claimantName: string;
  claimantEmail: string;
  statement: string;
  status: RightsClaimStatus;
  evidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}

export function createDmcaCase(input: Omit<DmcaCase, "caseId" | "status" | "createdAt" | "updatedAt">): DmcaCase {
  const now = new Date().toISOString();
  return {
    ...input,
    caseId: crypto.randomUUID(),
    status: "takedown_requested",
    createdAt: now,
    updatedAt: now,
  };
}
