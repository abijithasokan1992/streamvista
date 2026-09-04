import { Router } from 'express';
import { AgentService } from '../services/AgentService';

const router = Router();

router.get('/activities', (_req, res) => {
  res.json(AgentService.getRecentActivities());
});

router.get('/queue', async (_req, res) => {
  try {
    const { getDbClient } = await import('../config/db');
    const { data, error } = await getDbClient()
      .from('sales_agent_queue')
      .select('id,task_type,assigned_agent,priority,status,approval_required,approval_id,payload,result,attempt_count,available_at,started_at,completed_at,created_at,updated_at,lead_id,opportunity_id')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(100);
    if (error) throw new Error(error.message);
    res.json({ queue: data || [], count: data?.length || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/enqueue', async (req, res) => {
  try {
    const queued = await AgentService.enqueue(req.body || {});
    res.status(queued.created ? 202 : 200).json(queued);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/process-next', async (_req, res) => {
  const task = await AgentService.claimNext();
  if (!task) return res.status(204).send();

  try {
    const { getDbClient } = await import('../config/db');
    const client = getDbClient();
    const evidence: Record<string, unknown> = {
      taskId: task.id,
      taskType: task.task_type,
      assignedAgent: task.assigned_agent,
      execution: 'safe_non_binding',
    };

    if (task.task_type === 'revenue_synthesis') {
      const [leads, opportunities, payments, queued] = await Promise.all([
        client.from('sales_leads').select('id', { count: 'exact', head: true }),
        client.from('sales_opportunities').select('id', { count: 'exact', head: true }),
        client.from('razorpay_payment_facts').select('id', { count: 'exact', head: true }),
        client.from('sales_agent_queue').select('id', { count: 'exact', head: true }).in('status', ['queued', 'running', 'awaiting_approval']),
      ]);
      if (leads.error || opportunities.error || payments.error || queued.error) {
        throw new Error([leads.error, opportunities.error, payments.error, queued.error].find(Boolean)?.message || 'Evidence query failed');
      }
      evidence.snapshot = {
        salesLeads: leads.count ?? 0,
        salesOpportunities: opportunities.count ?? 0,
        persistedPaymentFacts: payments.count ?? 0,
        activeQueueItems: queued.count ?? 0,
      };
    } else if (task.task_type === 'follow_up_prepare') {
      const { data, error } = await client
        .from('sales_leads')
        .select('id,company_name,contact_name,email,priority,grade,next_best_action,next_action_at,status')
        .in('status', ['active', 'qualified', 'open'])
        .in('grade', ['HOT', 'WARM'])
        .not('next_action_at', 'is', null)
        .lte('next_action_at', new Date().toISOString())
        .order('priority', { ascending: true })
        .limit(20);
      if (error) throw new Error(error.message);
      evidence.followUpsDue = data || [];
    } else if (task.task_type === 'buyer_match') {
      const { data, error } = await client
        .from('sales_leads')
        .select('id,company_name,contact_name,content_interest,rights_interest,language,territory,total_score,grade,status,next_best_action')
        .in('lead_type', ['buyer', 'partner'])
        .in('status', ['active', 'qualified', 'open'])
        .order('total_score', { ascending: false })
        .limit(20);
      if (error) throw new Error(error.message);
      evidence.candidateBuyers = data || [];
    } else {
      evidence.note = 'No external side effect performed. Task produced only evidence-backed preparation.';
    }

    const completed = await AgentService.completeTask(task.id, { verified: true, evidence });
    await AgentService.logActivity({
      agentName: task.assigned_agent,
      action: `A2A task completed: ${task.task_type}`,
      thought: 'Completed only non-binding evidence preparation; no financial, rights, access or external communication state was changed.',
      timestamp: new Date(),
      status: 'EXECUTED',
      metadata: { taskId: task.id, evidence },
      correlationId: task.payload?.a2a?.context_id,
    });
    return res.json({ task: completed, evidence });
  } catch (err: any) {
    const failed = await AgentService.failTask(task.id, { verified: false, error: err.message, failClosed: true });
    await AgentService.logActivity({
      agentName: task.assigned_agent,
      action: `A2A task failed closed: ${task.task_type}`,
      thought: 'Task was stopped without external side effects because the required evidence path failed.',
      timestamp: new Date(),
      status: 'FAILED',
      metadata: { taskId: task.id, error: err.message },
      correlationId: task.payload?.a2a?.context_id,
    });
    return res.status(500).json({ task: failed, error: 'Task failed closed' });
  }
});

router.get('/task/:id', async (req, res) => {
  try {
    const task = await AgentService.getTask(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/task/:id/cancel', async (req, res) => {
  try {
    const task = await AgentService.cancelTask(req.params.id, String(req.body?.reason || 'founder_cancelled'));
    if (!task) return res.status(409).json({ error: 'Task cannot be cancelled in its current state' });
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
