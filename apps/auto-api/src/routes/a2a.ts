import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { AgentService } from '../services/AgentService';

const router = Router();

function isAuthorized(req: any) {
  const expected = String(process.env.A2A_SHARED_SECRET || '').trim();
  const provided = String(req.headers.authorization || '');
  return Boolean(expected) && provided === `Bearer ${expected}`;
}

function rpcError(id: unknown, code: number, message: string, data?: unknown) {
  return {
    jsonrpc: '2.0',
    id: id ?? null,
    error: { code, message, ...(data === undefined ? {} : { data }) },
  };
}

function rpcOk(id: unknown, result: unknown) {
  return { jsonrpc: '2.0', id: id ?? null, result };
}

function extractText(message: any): string {
  const parts = Array.isArray(message?.parts) ? message.parts : [];
  return parts
    .filter((part: any) => part?.kind === 'text' && typeof part.text === 'string')
    .map((part: any) => part.text.trim())
    .filter(Boolean)
    .join('\n');
}

function inferTaskType(text: string, metadata: Record<string, unknown>) {
  const explicit = typeof metadata.task_type === 'string' ? metadata.task_type.trim() : '';
  if (explicit) return explicit;

  const normalized = text.toLowerCase();
  if (/payment|razorpay|collection|collect/.test(normalized)) return 'payment_reconcile';
  if (/buyer|match|license|catalog/.test(normalized)) return 'buyer_match';
  if (/rights|chain of title|territory/.test(normalized)) return 'rights_readiness';
  if (/creator|onboard|readiness/.test(normalized)) return 'creator_qualification';
  if (/follow.?up|reply|email|outreach/.test(normalized)) return 'follow_up_prepare';
  if (/deal|offer|negotiat|close/.test(normalized)) return 'deal_next_action';
  return 'revenue_synthesis';
}

function taskState(queueStatus: string) {
  switch (queueStatus) {
    case 'running': return 'working';
    case 'awaiting_approval': return 'input-required';
    case 'completed': return 'completed';
    case 'cancelled': return 'canceled';
    case 'failed': return 'failed';
    default: return 'submitted';
  }
}

router.post('/', async (req, res) => {
  if (!isAuthorized(req)) {
    res.setHeader('WWW-Authenticate', 'Bearer');
    return res.status(401).json(rpcError(req.body?.id, -32001, 'A2A authentication required'));
  }

  const request = req.body;
  if (!request || request.jsonrpc !== '2.0' || typeof request.method !== 'string') {
    return res.status(400).json(rpcError(null, -32600, 'Invalid JSON-RPC request'));
  }

  try {
    if (request.method === 'message/send') {
      const message = request.params?.message;
      if (!message) return res.status(400).json(rpcError(request.id, -32602, 'message is required'));

      const text = extractText(message);
      const metadata = (request.params?.metadata || {}) as Record<string, unknown>;
      const taskType = inferTaskType(text, metadata);
      const payload = {
        request: {
          messageId: message.messageId || randomUUID(),
          role: message.role || 'user',
          text,
        },
        metadata,
      };

      const queued = await AgentService.enqueue({
        taskType,
        entityType: typeof metadata.entity_type === 'string' ? metadata.entity_type as any : 'business',
        entityId: typeof metadata.entity_id === 'string' ? metadata.entity_id : undefined,
        leadId: typeof metadata.lead_id === 'string' ? metadata.lead_id : undefined,
        opportunityId: typeof metadata.opportunity_id === 'string' ? metadata.opportunity_id : undefined,
        priority: typeof metadata.priority === 'string' ? metadata.priority as any : undefined,
        assignedAgent: typeof metadata.assigned_agent === 'string' ? metadata.assigned_agent : undefined,
        requiresApproval: typeof metadata.requires_approval === 'boolean' ? metadata.requires_approval : undefined,
        contextId: typeof message.contextId === 'string' ? message.contextId : undefined,
        messageId: typeof message.messageId === 'string' ? message.messageId : undefined,
        payload,
      });

      const task = queued.task as any;
      return res.json(rpcOk(request.id, {
        id: task.id,
        contextId: task.payload?.a2a?.context_id || randomUUID(),
        status: { state: taskState(task.status) },
        metadata: {
          queueStatus: task.status,
          assignedAgent: task.assigned_agent,
          approvalRequired: task.approval_required,
          approvalId: task.approval_id,
          deduplicated: queued.deduplicated,
        },
      }));
    }

    if (request.method === 'tasks/get') {
      const taskId = String(request.params?.id || '');
      if (!taskId) return res.status(400).json(rpcError(request.id, -32602, 'task id is required'));
      const task = await AgentService.getTask(taskId);
      if (!task) return res.status(404).json(rpcError(request.id, -32004, 'Task not found'));
      return res.json(rpcOk(request.id, {
        id: task.id,
        contextId: task.payload?.a2a?.context_id || randomUUID(),
        status: {
          state: taskState(task.status),
          ...(task.status === 'failed' || task.status === 'awaiting_approval' ? {
            message: {
              role: 'agent',
              parts: [{ kind: 'text', text: JSON.stringify(task.result || {}) }],
            },
          } : {}),
        },
        metadata: {
          queueStatus: task.status,
          assignedAgent: task.assigned_agent,
          approvalRequired: task.approval_required,
          approvalId: task.approval_id,
          attemptCount: task.attempt_count,
        },
        ...(task.status === 'completed' ? { artifacts: [{ artifactId: `${task.id}:result`, parts: [{ kind: 'data', data: task.result || {} }] }] } : {}),
      }));
    }

    if (request.method === 'tasks/cancel') {
      const taskId = String(request.params?.id || '');
      if (!taskId) return res.status(400).json(rpcError(request.id, -32602, 'task id is required'));
      const task = await AgentService.cancelTask(taskId);
      if (!task) return res.status(409).json(rpcError(request.id, -32009, 'Task cannot be cancelled in its current state'));
      return res.json(rpcOk(request.id, {
        id: task.id,
        contextId: task.payload?.a2a?.context_id || randomUUID(),
        status: { state: 'canceled' },
      }));
    }

    return res.status(404).json(rpcError(request.id, -32601, `Unsupported A2A method: ${request.method}`));
  } catch (error: any) {
    console.error('[A2A] request failed:', error);
    return res.status(500).json(rpcError(request.id, -32000, 'A2A task processing failed'));
  }
});

export default router;
