import { Request, Response } from 'express';
import { dbRepository } from '../db/database';

export async function getRegions(req: Request, res: Response) {
  try {
    const regions = await dbRepository.getRegions();
    res.json(regions);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching regions' });
  }
}

export async function createRegion(req: Request, res: Response) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Region name is required' });
    }
    
    const newRegion = await dbRepository.createRegion({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name
    });
    res.status(201).json(newRegion);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating region' });
  }
}

export async function getDistricts(req: Request, res: Response) {
  try {
    const districts = await dbRepository.getDistricts();
    res.json(districts);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error fetching districts' });
  }
}

export async function createDistrict(req: Request, res: Response) {
  try {
    const { name, regionId } = req.body;
    if (!name || !regionId) {
      return res.status(400).json({ error: 'District name and regionId are required' });
    }

    const newDistrict = await dbRepository.createDistrict({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      regionId,
      name
    });
    res.status(201).json(newDistrict);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error creating district' });
  }
}
