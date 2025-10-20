import { Request, Response } from 'express';
import * as customerService from '../services/customerService';

export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    // In a real app, you'd generate a JWT here and send it back
    res.status(201).json({ message: 'Customer registered successfully', customer: { id: customer.id, email: customer.email } });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to register customer', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to register customer', details: 'An unknown error occurred' });
    }
  }
};

export const loginCustomer = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const customer = await customerService.findCustomerByEmail(email);

    if (!customer) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await customerService.validatePassword(password, customer.password);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // In a real app, you'd generate a JWT here and send it back
    res.status(200).json({ message: 'Customer logged in successfully', customer: { id: customer.id, email: customer.email } });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to log in customer', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to log in customer', details: 'An unknown error occurred' });
    }
  }
};

export const joinLoyaltyProgram = async (req: Request, res: Response) => {
  try {
    const { customerId, merchantId } = req.body;
    const stamp = await customerService.joinMerchantLoyaltyProgram(customerId, merchantId);
    res.status(200).json({ message: 'Successfully joined loyalty program', stamp });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to join loyalty program', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to join loyalty program', details: 'An unknown error occurred' });
    }
  }
};

export const getCustomerStamps = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const stamps = await customerService.getCustomerStamps(customerId);
    res.status(200).json(stamps);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch customer stamps', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch customer stamps', details: 'An unknown error occurred' });
    }
  }
};

export const redeemReward = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { loyaltyProgramId } = req.body;
    const result = await customerService.redeemReward(customerId, loyaltyProgramId);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to redeem reward', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to redeem reward', details: 'An unknown error occurred' });
    }
  }
};

export const updateCustomerProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedCustomer = await customerService.updateCustomerProfile(id, req.body);
    res.status(200).json(updatedCustomer);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to update customer profile', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update customer profile', details: 'An unknown error occurred' });
    }
  }
};

export const getCustomersByMerchantId = async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;
    const customers = await customerService.getCustomersByMerchantId(merchantId);
    res.status(200).json(customers);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch customers for merchant', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch customers for merchant', details: 'An unknown error occurred' });
    }
  }
};