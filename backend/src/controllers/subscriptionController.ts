import { Request, Response } from 'express';
import * as subscriptionService from '../services/subscriptionService';

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const subscription = await subscriptionService.createSubscription(req.body);
    res.status(201).json(subscription);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to create subscription', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create subscription', details: 'An unknown error occurred' });
    }
  }
};

export const getSubscriptionByMerchantId = async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;
    const subscription = await subscriptionService.getSubscriptionByMerchantId(merchantId);
    if (subscription) {
      res.status(200).json(subscription);
    } else {
      res.status(404).json({ error: 'Subscription not found for this merchant' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch subscription', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch subscription', details: 'An unknown error occurred' });
    }
  }
};

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subscription = await subscriptionService.updateSubscription(id, req.body);
    res.status(200).json(subscription);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to update subscription', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update subscription', details: 'An unknown error occurred' });
    }
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subscription = await subscriptionService.cancelSubscription(id);
    res.status(200).json(subscription);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to cancel subscription', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to cancel subscription', details: 'An unknown error occurred' });
    }
  }
};
