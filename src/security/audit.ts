export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "rbac.denied"
  | "rbac.allowed"
  | "agent.proposed"
  | "agent.approved"
  | "agent.executed"
  | "agent.failed"
  | "dmca.created"
  | "dmca.updated";

export interface AuditEvent {
  id: string;
  action: AuditAction;
  actorId: string;
  actorType: "user" | "agent" | "system";
  target?: string;
  approvedBy?: string;
  status: "success" | "denied" | "failed" | "pending";
  timestamp: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export function createAuditEvent(input: Omit<AuditEvent, "id" | "timestamp">): AuditEvent {
  return {
    ...input,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
}
