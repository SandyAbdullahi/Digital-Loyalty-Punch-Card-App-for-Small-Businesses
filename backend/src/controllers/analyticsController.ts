import { Request, Response } from 'express';
import * as analyticsService from '../services/analyticsService';

export const getMerchantAnalytics = async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;
    const analytics = await analyticsService.getMerchantAnalytics(merchantId);
    res.status(200).json(analytics);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch analytics', details: 'An unknown error occurred' });
    }
  }
};