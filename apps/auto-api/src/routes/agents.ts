import { Router } from 'express';
import { AgentService, ProcurementAgent, RightsNegotiatorAgent, A2ASalesAgent } from '../services/AgentService';

const router = Router();

router.get('/activities', (req, res) => {
  try {
    res.json(AgentService.getRecentActivities());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/negotiate', async (req, res) => {
  try {
    const { assetId, counterParty, initialOffer } = req.body;
    res.json(await RightsNegotiatorAgent.negotiate(String(assetId), String(counterParty), Number(initialOffer)));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/leads', async (_req, res) => {
  try {
    res.json(await A2ASalesAgent.generateLeads());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/matchmaking', async (req, res) => {
  try {
    res.json(await A2ASalesAgent.dynamicMatchmaking(String(req.body.requirement || '')));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/pitch', async (req, res) => {
  try {
    res.json(await A2ASalesAgent.sendPitch(String(req.body.email || ''), req.body.pitchData));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/procurement/analyze', async (_req, res) => {
  try {
    res.json(await ProcurementAgent.analyzeInventory());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
