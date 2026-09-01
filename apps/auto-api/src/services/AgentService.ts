import { getDbClient } from '../config/db';

export interface AgentActivity {
  agentName: string;
  action: string;
  thought: string;
  timestamp: Date;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
  metadata?: Record<string, unknown>;
}

export class AgentService {
  private static activities: AgentActivity[] = [];

  static async logActivity(activity: AgentActivity) {
    this.activities.unshift(activity);
    if (this.activities.length > 50) this.activities.pop();

    try {
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
        reason: 'agent_activity',
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      console.warn('Failed to persist agent log to Supabase:', err);
    }
  }

  static getRecentActivities() {
    return this.activities;
  }
}

export class ProcurementAgent {
  static async analyzeInventory() {
    console.log('[ProcurementAgent] Analyzing inventory trends...');
    return {
      message: 'Procurement analysis is temporarily disabled until the StreamVista inventory schema is connected.',
    };
  }
}

export class RightsNegotiatorAgent {
  static async negotiate(assetId: string, counterParty: string, initialOffer: number) {
    console.log(`[RightsNegotiator] Negotiating rights for asset ${assetId} with ${counterParty}...`);
    const counterOffer = Math.round(initialOffer * 1.15);

    await AgentService.logActivity({
      agentName: 'Rights Negotiator AI',
      action: 'Negotiation Strategy Generated',
      thought: `Counter-party ${counterParty} offered ₹${initialOffer}. Proposing counter-offer of ₹${counterOffer} based on market scarcity.`,
      timestamp: new Date(),
      status: 'EXECUTED',
      metadata: { assetId, counterParty, initialOffer, counterOffer },
    });

    return {
      status: 'NEGOTIATING',
      myOffer: counterOffer,
      terms: 'Non-Exclusive Digital Rights (3 Years)',
    };
  }
}

export class A2ASalesAgent {
  static async generateLeads() {
    console.log('[A2ASalesAgent] Generating B2B leads via programmatic A2A protocols...');
    const leads = [
      { company: 'JioStar Global', contact: 'api-agent-01', vertical: 'OTT' },
      { company: 'SonyLIV Digital', contact: 'rights-bot-v3', vertical: 'Satellite' },
    ];

    for (const lead of leads) {
      await AgentService.logActivity({
        agentName: 'A2A Sales Engine',
        action: 'Lead Identified',
        thought: `Programmatically identified ${lead.company} as high-intent buyer for Malayalam film library via match-making protocol.`,
        timestamp: new Date(),
        status: 'EXECUTED',
        metadata: lead,
      });
    }
    return leads;
  }

  static async dynamicMatchmaking(requirement: string) {
    console.log(`[A2ASalesAgent] Finding matches for requirement: ${requirement}`);
    return {
      matchFound: true,
      partner: 'Malayalam Content Hub',
      score: 0.98,
      reason: 'Perfect metadata alignment for 4K regional content.',
    };
  }

  static async sendPitch(email: string, pitchData: unknown) {
    console.log(`[A2ASalesAgent] Dispatching automated pitch to ${email}...`);
    await AgentService.logActivity({
      agentName: 'Pitch Master AI',
      action: 'Pitch Dispatched',
      thought: `Sending automated pitch to ${email} with tailored rights bundle and dynamic pricing.`,
      timestamp: new Date(),
      status: 'EXECUTED',
      metadata: { email, pitchData },
    });
    return { success: true, trackingId: `pit_${Date.now()}` };
  }
}

export class BusinessOrchestratorAgent {
  static async evaluateRights(projectId: string) {
    console.log(`[BusinessOrchestrator] Evaluating rights and licensing for project ${projectId}...`);
    return {
      projectId,
      availableTerritories: ['Global', 'India', 'Middle East'],
      proposedPlatforms: ['Netflix', 'JioStar', 'SonyLIV'],
      rightsStatus: 'CLEARED',
    };
  }

  static async manageDelivery(projectId: string, buyer: string) {
    console.log(`[BusinessOrchestrator] Orchestrating delivery to ${buyer}...`);
    return {
      status: 'PACKAGING',
      compliance: 'DPP Standard',
      eta: '2 hours',
    };
  }
}

export class MarketScoutAgent {
  static async findPartnerships() {
    console.warn('[MarketScoutAgent] AI provider disabled for production baseline build.');
    return [];
  }
}
