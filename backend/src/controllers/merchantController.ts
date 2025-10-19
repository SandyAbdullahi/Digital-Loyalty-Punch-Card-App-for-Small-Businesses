
import { Request, Response } from 'express';
import * as merchantService from '../services/merchantService';

export const createMerchant = async (req: Request, res: Response) => {
  try {
    const merchant = await merchantService.createMerchant(req.body);
    res.status(201).json(merchant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create merchant' });
  }
};
