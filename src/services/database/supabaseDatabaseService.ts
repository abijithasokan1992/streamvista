import { supabase, isSupabaseConfigured } from "../../integrations/supabase/client";
import { Database } from "../../integrations/supabase/types";

export type TitleRow = Database['public']['Tables']['titles']['Row'];
export type DraftTitleRow = Database['public']['Tables']['draft_titles']['Row'];
export type QCReportRow = Database['public']['Tables']['qc_reports']['Row'];
export type LegalReviewRow = Database['public']['Tables']['legal_reviews']['Row'];
export type RevenueStatementRow = Database['public']['Tables']['revenue_statements']['Row'];
export type RevenueRow = Database['public']['Tables']['revenue_rows']['Row'];

export class SupabaseDatabaseService {
  async getTitles(userId?: string): Promise<TitleRow[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase.from('titles' as any).select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Supabase getTitles error:", error);
      return [];
    }
    return (data as any) || [];
  }

  async getTitleById(id: string): Promise<TitleRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('titles' as any).select('*').eq('id', id).single();
    if (error) return null;
    return data as any;
  }

  async createTitle(titleData: Database['public']['Tables']['titles']['Insert']): Promise<TitleRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('titles' as any).insert(titleData as any).select().single();
    if (error) throw error;
    return data as any;
  }

  async updateTitleStatus(id: string, status: TitleRow['status']): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('titles' as any).update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  }

  async saveDraftTitle(userId: string, draftId: string, metadata: Record<string, any>): Promise<DraftTitleRow | null> {
    if (!isSupabaseConfigured()) return null;
    const payload = {
      user_id: userId,
      draft_id: draftId,
      metadata: metadata as any,
      last_saved_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('draft_titles' as any)
      .upsert(payload, { onConflict: 'draft_id' })
      .select()
      .single();
    if (error) throw error;
    return data as any;
  }

  async getDraftTitle(userId: string, draftId: string): Promise<DraftTitleRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('draft_titles' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('draft_id', draftId)
      .maybeSingle();
    if (error) return null;
    return data as any;
  }

  async createQCReport(report: Database['public']['Tables']['qc_reports']['Insert']): Promise<QCReportRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('qc_reports' as any).insert(report as any).select().single();
    if (error) throw error;
    
    const titleStatus = report.status === 'passed' ? 'qc_passed' : 'qc_failed';
    await this.updateTitleStatus(report.title_id, titleStatus);
    await this.logAuditAction(report.reviewer_id, 'QC_REVIEW_SUBMITTED', 'title', report.title_id, { status: report.status });

    return data as any;
  }

  async createLegalReview(review: Database['public']['Tables']['legal_reviews']['Insert']): Promise<LegalReviewRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('legal_reviews' as any).insert(review as any).select().single();
    if (error) throw error;

    const titleStatus = review.status === 'cleared' ? 'legal_cleared' : 'submitted';
    await this.updateTitleStatus(review.title_id, titleStatus);
    await this.logAuditAction(review.attorney_id, 'LEGAL_CLEARANCE_UPDATED', 'title', review.title_id, { status: review.status });

    return data as any;
  }

  async importRevenueStatement(statement: Database['public']['Tables']['revenue_statements']['Insert'], rows: Database['public']['Tables']['revenue_rows']['Insert'][]): Promise<RevenueStatementRow | null> {
    if (!isSupabaseConfigured()) return null;
    const { data: stmt, error: stmtErr } = await supabase.from('revenue_statements' as any).insert(statement as any).select().single();
    if (stmtErr || !stmt) throw stmtErr;

    const stmtId = (stmt as any).id;
    const formattedRows = rows.map(r => ({ ...r, statement_id: stmtId }));
    const { error: rowErr } = await supabase.from('revenue_rows' as any).insert(formattedRows as any);
    if (rowErr) throw rowErr;

    return stmt as any;
  }

  async logAuditAction(userId: string, action: string, entityType: string, entityId?: string, details?: Record<string, any>): Promise<void> {
    if (!isSupabaseConfigured()) return;
    await supabase.from('audit_logs' as any).insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details as any,
      created_at: new Date().toISOString(),
    });
  }
}

export const supabaseDatabaseService = new SupabaseDatabaseService();
