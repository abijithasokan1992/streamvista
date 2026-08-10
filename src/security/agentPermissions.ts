import type { Permission } from "./rbac";

export type AgentId =
  | "github-agent"
  | "deployment-agent"
  | "gmail-agent"
  | "finance-agent"
  | "content-rights-agent";

export interface AgentPolicy {
  permissions: readonly Permission[];
  requiresHumanApprovalForWrite: boolean;
}

export const AGENT_POLICIES: Record<AgentId, AgentPolicy> = {
  "github-agent": {
    permissions: ["agent.read", "deployment.read", "audit.read"],
    requiresHumanApprovalForWrite: true,
  },
  "deployment-agent": {
    permissions: ["deployment.read", "agent.read", "audit.read"],
    requiresHumanApprovalForWrite: true,
  },
  "gmail-agent": {
    permissions: ["support.read", "support.write", "agent.read"],
    requiresHumanApprovalForWrite: true,
  },
  "finance-agent": {
    permissions: ["finance.read", "agent.read", "audit.read"],
    requiresHumanApprovalForWrite: true,
  },
  "content-rights-agent": {
    permissions: ["titles.read", "qc.read", "legal.read", "agent.read", "audit.read"],
    requiresHumanApprovalForWrite: true,
  },
};

export function agentCan(agent: AgentId, permission: Permission): boolean {
  return AGENT_POLICIES[agent].permissions.includes(permission);
}
