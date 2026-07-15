import { Request, Response } from 'express';
import { dbRepository } from '../db/database';

export async function getPlans(req: Request, res: Response) {
  try {
    const plans = await dbRepository.getPlans();
    res.json(plans);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching plans' });
  }
}

export async function createPlan(req: Request, res: Response) {
  try {
    const newPlan = await dbRepository.createPlan({
      id: req.body.name.toLowerCase().replace(/\s+/g, '-'),
      ...req.body
    });
    res.status(201).json(newPlan);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating plan' });
  }
}

export async function updatePlan(req: Request, res: Response) {
  try {
    const updated = await dbRepository.updatePlan(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error updating plan' });
  }
}

export async function getSubscriptionHistory(req: Request, res: Response) {
  try {
    const history = await dbRepository.getSubscriptionHistory();
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching subscription history' });
  }
}

export async function createSubscriptionHistoryItem(req: Request, res: Response) {
  try {
    const newItem = await dbRepository.createSubscriptionHistoryItem(req.body);
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating subscription history item' });
  }
}
