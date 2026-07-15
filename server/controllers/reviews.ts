import { Request, Response } from 'express';
import { dbRepository } from '../db/database';

export async function getReviews(req: Request, res: Response) {
  try {
    const reviews = await dbRepository.getReviews();
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching reviews' });
  }
}

export async function createReview(req: Request, res: Response) {
  try {
    const newReview = await dbRepository.createReview(req.body);
    res.status(201).json(newReview);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating review' });
  }
}
