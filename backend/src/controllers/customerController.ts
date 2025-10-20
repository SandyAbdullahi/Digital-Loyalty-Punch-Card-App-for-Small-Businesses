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
    const { customerId, programIdentifier } = req.body;
    console.log('[CustomerController.joinLoyaltyProgram] Incoming request', {
      customerId,
      programIdentifier,
    });
    if (!programIdentifier) {
      console.log('[CustomerController.joinLoyaltyProgram] Missing programIdentifier');
      return res.status(400).json({ error: 'Program identifier is required.' });
    }
    const { merchantId, loyaltyProgramId } = await customerService.resolveProgramIdentifier(programIdentifier);
    console.log('[CustomerController.joinLoyaltyProgram] Resolved identifier', {
      merchantId,
      loyaltyProgramId,
    });
    const stamp = await customerService.joinMerchantLoyaltyProgram(customerId, merchantId, loyaltyProgramId);
    console.log('[CustomerController.joinLoyaltyProgram] Join succeeded', {
      stampId: stamp.id,
      merchantId: stamp.merchantId,
      loyaltyProgramId,
    });
    res.status(200).json({ message: 'Successfully joined loyalty program', stamp, loyaltyProgramId });
  } catch (error) {
    if (error instanceof Error) {
      console.log('[CustomerController.joinLoyaltyProgram] Join failed', {
        error: error.message,
        stack: error.stack,
      });
      if (error.message.includes('Invalid program identifier')) {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes('already joined this merchant')) {
        res.status(409).json({ error: error.message });
      } else if (error.message.includes('already joined this loyalty program')) {
        res.status(409).json({ error: error.message });
      } else if (error.message.includes('Customer not found')) {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Merchant not found')) {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('Loyalty program not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to join loyalty program', details: error.message });
      }
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

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.status(200).json({ id: customer.id, email: customer.email, createdAt: customer.createdAt });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch customer', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch customer', details: 'An unknown error occurred' });
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

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(id);
    if (customer) {
      res.status(200).json(customer);
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch customer', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch customer', details: 'An unknown error occurred' });
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
    }
  }
};

export const deleteCustomerStampsForMerchant = async (req: Request, res: Response) => {
  try {
    const { merchantId, customerId } = req.params;
    await customerService.deleteCustomerStampsForMerchant(merchantId, customerId);
    res.status(200).json({ message: 'Customer successfully disassociated from loyalty program.' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to disassociate customer', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to disassociate customer', details: 'An unknown error occurred' });
    }
  }
};

export const getCustomerHistoryForMerchant = async (req: Request, res: Response) => {
  try {
    const { merchantId, customerId } = req.params;
    const history = await customerService.getCustomerHistoryForMerchant(merchantId, customerId);
    res.status(200).json(history);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch customer history', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch customer history', details: 'An unknown error occurred' });
    }
  }
};
