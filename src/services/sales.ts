import { assertSupabaseConfigured, supabase } from "./supabase";

export type SalesLead = {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  lead_type: string;
  territory: string | null;
  language: string | null;
  rights_interest: string | null;
  content_interest: string | null;
  license_model: string | null;
  stage: string;
  priority: "P0" | "P1" | "P2" | "P3";
  grade: "A" | "B" | "C" | "D";
  agent_lane: "hot" | "qualify" | "research" | "nurture" | "hold";
  total_score: number;
  rights_status: "unknown" | "declared" | "verified" | "blocked";
  next_best_action: string | null;
  next_action_at: string | null;
  approval_required: boolean;
  updated_at: string;
};

export type SalesOpportunity = {
  id: string;
  lead_id: string;
  name: string;
  stage: string;
  amount: number | string | null;
  currency: string;
  probability: number;
  expected_close: string | null;
  rights_confirmed: boolean;
  commercial_approved: boolean;
  approval_required: boolean;
  next_action: string | null;
};

export type SalesAgentTask = {
  id: string;
  lead_id: string | null;
  opportunity_id: string | null;
  task_type: string;
  assigned_agent: string;
  priority: "P0" | "P1" | "P2" | "P3";
  status: "queued" | "running" | "awaiting_approval" | "completed" | "failed" | "cancelled";
  approval_required: boolean;
  available_at: string;
};

export type SalesCommandSnapshot = {
  leads: SalesLead[];
  opportunities: SalesOpportunity[];
  tasks: SalesAgentTask[];
};

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function loadSalesCommandSnapshot(): Promise<SalesCommandSnapshot> {
  assertSupabaseConfigured();

  const [leadsResult, opportunitiesResult, tasksResult] = await Promise.all([
    supabase
      .from("sales_leads")
      .select(
        "id,company_name,contact_name,email,lead_type,territory,language,rights_interest,content_interest,license_model,stage,priority,grade,agent_lane,total_score,rights_status,next_best_action,next_action_at,approval_required,updated_at",
      )
      .neq("status", "archived")
      .order("priority", { ascending: true })
      .order("total_score", { ascending: false })
      .limit(250),
    supabase
      .from("sales_opportunities")
      .select(
        "id,lead_id,name,stage,amount,currency,probability,expected_close,rights_confirmed,commercial_approved,approval_required,next_action",
      )
      .order("probability", { ascending: false })
      .limit(100),
    supabase
      .from("sales_agent_queue")
      .select("id,lead_id,opportunity_id,task_type,assigned_agent,priority,status,approval_required,available_at")
      .in("status", ["queued", "running", "awaiting_approval", "failed"])
      .order("priority", { ascending: true })
      .order("available_at", { ascending: true })
      .limit(150),
  ]);

  throwIf(leadsResult.error);
  throwIf(opportunitiesResult.error);
  throwIf(tasksResult.error);

  return {
    leads: (leadsResult.data || []) as SalesLead[],
    opportunities: (opportunitiesResult.data || []) as SalesOpportunity[],
    tasks: (tasksResult.data || []) as SalesAgentTask[],
  };
}
