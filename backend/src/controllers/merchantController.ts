
import { Request, Response } from 'express';

import * as merchantService from '../services/merchantService';



export const createMerchant = async (req: Request, res: Response) => {

  try {

    const merchant = await merchantService.createMerchant(req.body);

    res.status(201).json(merchant);

  } catch (error) {

    if (error instanceof Error) {

      res.status(500).json({ error: 'Failed to create merchant', details: error.message });

    } else {

      res.status(500).json({ error: 'Failed to create merchant', details: 'An unknown error occurred' });

    }

  }

};



export const updateMerchant = async (req: Request, res: Response) => {

  try {

    const { id } = req.params;

    const merchant = await merchantService.updateMerchant(id, req.body);

    res.status(200).json(merchant);

  } catch (error) {

    if (error instanceof Error) {

      res.status(500).json({ error: 'Failed to update merchant', details: error.message });

    } else {

      res.status(500).json({ error: 'Failed to update merchant', details: 'An unknown error occurred' });

    }

  }

};



export const getMerchantById = async (req: Request, res: Response) => {

  try {

    const { id } = req.params;

    const merchant = await merchantService.getMerchantById(id);

    if (merchant) {

      res.status(200).json(merchant);

    } else {

      res.status(404).json({ error: 'Merchant not found' });

    }

  } catch (error) {

    if (error instanceof Error) {

      res.status(500).json({ error: 'Failed to fetch merchant', details: error.message });

    } else {

      res.status(500).json({ error: 'Failed to fetch merchant', details: 'An unknown error occurred' });

    }

  }

};



export const getAllMerchants = async (req: Request, res: Response) => {

  try {

    const merchants = await merchantService.getAllMerchants();

    res.status(200).json(merchants);

  } catch (error) {

    if (error instanceof Error) {

      res.status(500).json({ error: 'Failed to fetch merchants', details: error.message });

    } else {

      res.status(500).json({ error: 'Failed to fetch merchants', details: 'An unknown error occurred' });

    }

  }

};



export const issueStamp = async (req: Request, res: Response) => {

  try {

    const { merchantId } = req.params;

    const { customerId } = req.body;

    const stamp = await merchantService.issueStamp(merchantId, customerId);

    res.status(200).json({ message: 'Stamp issued successfully', stamp });

  } catch (error) {

    if (error instanceof Error) {

      res.status(500).json({ error: 'Failed to issue stamp', details: error.message });

    } else {

      res.status(500).json({ error: 'Failed to issue stamp', details: 'An unknown error occurred' });

    }

  }

};

export const getCustomersByMerchantId = async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;
    const customers = await merchantService.getCustomersByMerchantId(merchantId);
    res.status(200).json(customers);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch customers', details: 'An unknown error occurred' });
    }
  }
};

export const updateMerchantSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subscriptionPlan } = req.body;
    const updatedMerchant = await merchantService.updateMerchantSubscription(id, subscriptionPlan);
    res.status(200).json(updatedMerchant);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to update subscription plan', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update subscription plan', details: 'An unknown error occurred' });
    }
  }
};

export const getNearbyMerchants = async (req: Request, res: Response) => {
  try {
    const { location } = req.query;
    if (!location || typeof location !== 'string') {
      return res.status(400).json({ error: 'Location query parameter is required.' });
    }
    const merchants = await merchantService.getNearbyMerchants(location);
    res.status(200).json(merchants);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch nearby merchants', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch nearby merchants', details: 'An unknown error occurred' });
    }
  }
};
