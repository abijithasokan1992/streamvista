import { randomUUID } from 'node:crypto';
import { getDbClient } from '../config/db';

export type AgentStatus = 'PENDING' | 'EXECUTED' | 'FAILED';
export type BusinessPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type QueueStatus = 'queued' | 'running' | 'awaiting_approval' | 'completed' | 'failed' | 'cancelled';

export interface AgentActivity {
  agentName: string;
  action: string;
  thought: string;
  timestamp: Date;
  status: AgentStatus;
  metadata?: Record<string, unknown>;
  correlationId?: string;
}

export interface A2ATaskRequest {
  taskType: string;
  entityType?: 'lead' | 'creator' | 'title' | 'buyer' | 'deal' | 'payment' | 'business';
  entityId?: string;
  leadId?: string;
  opportunityId?: string;
  priority?: BusinessPriority;
  assignedAgent?: string;
  payload?: Record<string, unknown>;
  requiresApproval?: boolean;
  contextId?: string;
  messageId?: string;
}

const APPROVAL_REQUIRED_TASKS = new Set([
  'payment_capture',
  'refund',
  'role_change',
  'rights_approval',
  'deal_finalization',
  'external_creator_buyer_contact',
  'send_email',
  'send_message',
  'contract_acceptance',
]);

const AGENT_BY_TASK: Record<string, string> = {
  revenue_synthesis: 'revenue-orchestrator',
  creator_qualification: 'creator-acquisition',
  rights_readiness: 'rights-catalog',
  buyer_match: 'buyer-match',
  deal_next_action: 'deal-desk',
  payment_reconcile: 'payment',
  follow_up_prepare: 'follow-up',
  payment_capture: 'payment',
  refund: 'payment',
  rights_approval: 'rights-catalog',
  deal_finalization: 'deal-desk',
  external_creator_buyer_contact: 'follow-up',
  send_email: 'follow-up',
  send_message: 'follow-up',
};

export class AgentService {
  private static activities: AgentActivity[] = [];

  static async logActivity(activity: AgentActivity) {
    const correlationId = activity.correlationId ?? randomUUID();
    const normalized = { ...activity, correlationId };
    this.activities.unshift(normalized);
    if (this.activities.length > 100) this.activities.pop();

    const client = getDbClient();
    const { error } = await client.from('sv_audit_events').insert({
      actor_id: null,
      actor_role: 'agent',
      action: `${activity.agentName}: ${activity.action}`,
      entity_type: 'agent_activity',
      entity_id: null,
      before_state: null,
      after_state: {
        thought: activity.thought,
        status: activity.status,
        timestamp: activity.timestamp.toISOString(),
        metadata: activity.metadata || {},
      },
      reason: 'a2a_agent_activity',
      correlation_id: correlationId,
    });
    if (error) throw new Error(`Failed to persist agent audit event: ${error.message}`);
  }

  static getRecentActivities() {
    return this.activities;
  }

  static resolveAgent(taskType: string, assignedAgent?: string) {
    return assignedAgent || AGENT_BY_TASK[taskType] || 'revenue-orchestrator';
  }

  static requiresApproval(taskType: string, requested?: boolean) {
    return requested ?? APPROVAL_REQUIRED_TASKS.has(taskType);
  }

  static priorityFor(input: { revenueImpact?: number; probability?: number; urgency?: number; strategicValue?: number; effort?: number; requested?: BusinessPriority }): BusinessPriority {
    if (input.requested) return input.requested;
    const revenue = Math.max(0, Math.min(1, input.revenueImpact ?? 0));
    const probability = Math.max(0, Math.min(1, input.probability ?? 0.5));
    const urgency = Math.max(0, Math.min(1, input.urgency ?? 0.5));
    const strategic = Math.max(0, Math.min(1, input.strategicValue ?? 0.5));
    const effort = Math.max(0.1, input.effort ?? 0.5);
    const score = (revenue * probability * urgency * strategic) / effort;
    if (score >= 0.45) return 'P0';
    if (score >= 0.22) return 'P1';
    if (score >= 0.08) return 'P2';
    return 'P3';
  }

  static async enqueue(input: A2ATaskRequest) {
    const client = getDbClient();
    const taskType = String(input.taskType || '').trim();
    if (!taskType) throw new Error('taskType is required');

    const assignedAgent = this.resolveAgent(taskType, input.assignedAgent);
    const priority = input.priority || 'P2';
    const approvalRequired = this.requiresApproval(taskType, input.requiresApproval);
    const messageId = input.messageId || randomUUID();
    const contextId = input.contextId || randomUUID();
    const dedupeKey = [
      taskType,
      input.entityType || 'business',
      input.entityId || input.leadId || input.opportunityId || 'global',
    ].join(':');

    const { data: existing, error: existingError } = await client
      .from('sales_agent_queue')
      .select('id,status,assigned_agent,priority,approval_required,approval_id,payload,result,attempt_count,available_at,started_at,completed_at,created_at,updated_at,lead_id,opportunity_id,task_type')
      .in('status', ['queued', 'running', 'awaiting_approval'])
      .contains('payload', { dedupe_key: dedupeKey })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingError) throw new Error(`Queue deduplication check failed: ${existingError.message}`);
    if (existing) return { created: false, deduplicated: true, task: existing };

    const payload = {
      ...(input.payload || {}),
      entity_type: input.entityType || 'business',
      entity_id: input.entityId || null,
      a2a: {
        protocol_version: '0.3.0',
        message_id: messageId,
        context_id: contextId,
        dedupe_key: dedupeKey,
        assigned_agent: assignedAgent,
      },
      dedupe_key: dedupeKey,
      execution_policy: approvalRequired ? 'approval_required' : 'safe_non_binding',
    };

    const { data: inserted, error: insertError } = await client
      .from('sales_agent_queue')
      .insert({
        lead_id: input.leadId || null,
        opportunity_id: input.opportunityId || null,
        task_type: taskType,
        assigned_agent: assignedAgent,
        priority,
        status: approvalRequired ? 'awaiting_approval' : 'queued',
        approval_required: approvalRequired,
        payload,
        result: {},
      })
      .select('*')
      .single();
    if (insertError) throw new Error(`Failed to enqueue A2A task: ${insertError.message}`);

    if (approvalRequired) {
      const { data: approval, error: approvalError } = await client
        .from('approval_queue')
        .insert({
          action_type: taskType,
          service: 'streamvista-a2a',
          subject_type: input.entityType || 'business',
          subject_id: input.entityId || input.leadId || input.opportunityId || null,
          status: 'pending',
          risk_level: taskType === 'refund' || taskType === 'role_change' ? 'critical' : 'high',
          payload: {
            queue_id: inserted.id,
            message_id: messageId,
            context_id: contextId,
            task_type: taskType,
          },
        })
        .select('id')
        .single();
      if (approvalError) {
        await client.from('sales_agent_queue').update({ status: 'failed', result: { code: 'approval_creation_failed', detail: approvalError.message } }).eq('id', inserted.id);
        throw new Error(`A2A approval creation failed: ${approvalError.message}`);
      }

      const { data: linked, error: linkError } = await client
        .from('sales_agent_queue')
        .update({ approval_id: approval.id })
        .eq('id', inserted.id)
        .select('*')
        .single();
      if (linkError) throw new Error(`Failed to link approval to A2A task: ${linkError.message}`);
      return { created: true, deduplicated: false, task: linked };
    }

    return { created: true, deduplicated: false, task: inserted };
  }

  static async getTask(taskId: string) {
    const { data, error } = await getDbClient()
      .from('sales_agent_queue')
      .select('*')
      .eq('id', taskId)
      .maybeSingle();
    if (error) throw new Error(`A2A task lookup failed: ${error.message}`);
    return data;
  }

  static async cancelTask(taskId: string, reason = 'client_cancelled') {
    const { data, error } = await getDbClient()
      .from('sales_agent_queue')
      .update({ status: 'cancelled', result: { code: 'cancelled', reason }, completed_at: new Date().toISOString() })
      .eq('id', taskId)
      .in('status', ['queued', 'awaiting_approval'])
      .select('*')
      .maybeSingle();
    if (error) throw new Error(`A2A task cancellation failed: ${error.message}`);
    return data;
  }

  static async claimNext() {
    const client = getDbClient();
    const now = new Date().toISOString();
    const { data: candidate, error: findError } = await client
      .from('sales_agent_queue')
      .select('*')
      .eq('status', 'queued')
      .lte('available_at', now)
      .order('priority', { ascending: true })
      .order('available_at', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (findError) throw new Error(`A2A queue read failed: ${findError.message}`);
    if (!candidate) return null;

    const { data: claimed, error: claimError } = await client
      .from('sales_agent_queue')
      .update({ status: 'running', started_at: now, attempt_count: Number(candidate.attempt_count || 0) + 1 })
      .eq('id', candidate.id)
      .eq('status', 'queued')
      .eq('attempt_count', Number(candidate.attempt_count || 0))
      .select('*')
      .maybeSingle();
    if (claimError) throw new Error(`A2A task claim failed: ${claimError.message}`);
    return claimed;
  }

  static async completeTask(taskId: string, result: Record<string, unknown>) {
    const { data, error } = await getDbClient()
      .from('sales_agent_queue')
      .update({ status: 'completed', result, completed_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('status', 'running')
      .select('*')
      .maybeSingle();
    if (error) throw new Error(`A2A task completion failed: ${error.message}`);
    return data;
  }

  static async failTask(taskId: string, result: Record<string, unknown>) {
    const { data, error } = await getDbClient()
      .from('sales_agent_queue')
      .update({ status: 'failed', result, completed_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('status', 'running')
      .select('*')
      .maybeSingle();
    if (error) throw new Error(`A2A task failure update failed: ${error.message}`);
    return data;
  }
}
