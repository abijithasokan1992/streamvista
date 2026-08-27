import { Router } from 'express';
import { AgentService, ProcurementAgent, RightsNegotiatorAgent, A2ASalesAgent } from '../services/AgentService';

const router = Router();

router.get('/activities', (req, res) => {
  try {
    const activities = AgentService.getRecentActivities();
    res.json(activities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/negotiate', async (req, res) => {
  try {
    const { assetId, counterParty, initialOffer } = req.body;
    const result = await RightsNegotiatorAgent.negotiate(assetId, counterParty, initialOffer);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/leads', async (req, res) => {
  try {
    const leads = await A2ASalesAgent.generateLeads();
    res.json(leads);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/matchmaking', async (req, res) => {
  try {
    const { requirement } = req.body;
    const result = await A2ASalesAgent.dynamicMatchmaking(requirement);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/pitch', async (req, res) => {
  try {
    const { email, pitchData } = req.body;
    const result = await A2ASalesAgent.sendPitch(email, pitchData);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/procurement/analyze', async (req, res) => {
  try {
    const result = await ProcurementAgent.analyzeInventory();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
