import { executeQuery } from '../config/db';

export interface AgentActivity {
  agentName: string;
  action: string;
  thought: string;
  timestamp: Date;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
  metadata?: any;
}

export class AgentService {
  private static activities: AgentActivity[] = [];

  static async logActivity(activity: AgentActivity) {
    this.activities.unshift(activity);
    if (this.activities.length > 50) this.activities.pop();

    const sql = `
      INSERT INTO audit_logs (user_id, action, details)
      VALUES (0, :action, :details)
    `;
    try {
      await executeQuery(sql, {
        action: `${activity.agentName}: ${activity.action}`,
        details: JSON.stringify({ thought: activity.thought, ...activity.metadata })
      });
    } catch (err) {
      console.warn('Failed to persist agent log to DB:', err);
    }
  }

  static getRecentActivities() {
    return this.activities;
  }
}

export class ProcurementAgent {
  static async analyzeInventory() {
    console.log('[ProcurementAgent] Analyzing inventory trends...');
    try {
      const lowStockSql = `
        SELECT i.*, p.product_name, p.sku, p.price, w.warehouse_name
        FROM inventory i
        JOIN products p ON i.product_id = p.product_id
        JOIN warehouses w ON i.warehouse_id = w.warehouse_id
        WHERE i.quantity <= 10
      `;
      const result: any = await executeQuery(lowStockSql);
      const items = result.rows;

      if (items.length > 0) {
        for (const item of items) {
          await AgentService.logActivity({
            agentName: 'Procurement AI',
            action: `Generated Draft PO for ${item.PRODUCT_NAME}`,
            thought: `Stock for ${item.PRODUCT_NAME} (${item.SKU}) is at ${item.QUANTITY} units in ${item.WAREHOUSE_NAME}. Recommended order: 50 units.`,
            timestamp: new Date(),
            status: 'PENDING',
            metadata: { productId: item.PRODUCT_ID, recommendedQty: 50 }
          });
        }
        return { message: `${items.length} draft purchase orders generated.` };
      }

      return { message: 'Inventory levels are optimal. No action required.' };
    } catch (err: any) {
      await AgentService.logActivity({
        agentName: 'Procurement AI',
        action: 'Inventory Analysis Failed',
        thought: 'An error occurred while querying the database.',
        timestamp: new Date(),
        status: 'FAILED',
        metadata: { error: err.message }
      });
      throw err;
    }
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
      metadata: { assetId, counterParty, initialOffer, counterOffer }
    });

    return {
      status: 'NEGOTIATING',
      myOffer: counterOffer,
      terms: 'Non-Exclusive Digital Rights (3 Years)'
    };
  }
}

export class A2ASalesAgent {
  static async generateLeads() {
    console.log('[A2ASalesAgent] Generating B2B leads via programmatic A2A protocols...');
    const leads = [
      { company: 'JioStar Global', contact: 'api-agent-01', vertical: 'OTT' },
      { company: 'SonyLIV Digital', contact: 'rights-bot-v3', vertical: 'Satellite' }
    ];

    for (const lead of leads) {
      await AgentService.logActivity({
        agentName: 'A2A Sales Engine',
        action: 'Lead Identified',
        thought: `Programmatically identified ${lead.company} as high-intent buyer for Malayalam film library via match-making protocol.`,
        timestamp: new Date(),
        status: 'EXECUTED',
        metadata: lead
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
      reason: 'Perfect metadata alignment for 4K regional content.'
    };
  }

  static async sendPitch(email: string, pitchData: any) {
    console.log(`[A2ASalesAgent] Dispatching automated pitch to ${email}...`);
    await AgentService.logActivity({
      agentName: 'Pitch Master AI',
      action: 'Pitch Dispatched',
      thought: `Sending automated pitch to ${email} with tailored rights bundle and dynamic pricing.`,
      timestamp: new Date(),
      status: 'EXECUTED',
      metadata: { email, pitchData }
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
      rightsStatus: 'CLEARED'
    };
  }

  static async manageDelivery(projectId: string, buyer: string) {
    console.log(`[BusinessOrchestrator] Orchestrating delivery to ${buyer}...`);
    return {
      status: 'PACKAGING',
      compliance: 'DPP Standard',
      eta: '2 hours'
    };
  }
}

export class MarketScoutAgent {
  static async findPartnerships() {
    console.warn('[MarketScoutAgent] AI provider disabled for production baseline build.');
    return [];
  }
}
