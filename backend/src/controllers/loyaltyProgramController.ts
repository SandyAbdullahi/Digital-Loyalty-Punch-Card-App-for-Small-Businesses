import { Request, Response } from 'express';
import * as loyaltyProgramService from '../services/loyaltyProgramService';
import { generateQrCode } from '../services/qrCodeService';

export const createLoyaltyProgram = async (req: Request, res: Response) => {
  try {
    // For MVP, construct a simple join URL. In a real app, this would be more robust.
    const joinUrl = `${process.env.FRONTEND_URL}/join/${req.body.merchantId}/${req.body.rewardName}`;
    const qrCodeDataUrl = await generateQrCode(joinUrl);

    const loyaltyProgram = await loyaltyProgramService.createLoyaltyProgram({
      ...req.body,
      qrCodeDataUrl,
    });
    res.status(201).json(loyaltyProgram);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to create loyalty program', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create loyalty program', details: 'An unknown error occurred' });
    }
  }
};

export const getLoyaltyProgramsByMerchantId = async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;
    const loyaltyPrograms = await loyaltyProgramService.getLoyaltyProgramsByMerchantId(merchantId);
    res.status(200).json(loyaltyPrograms);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch loyalty programs', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch loyalty programs', details: 'An unknown error occurred' });
    }
  }
};

export const getLoyaltyProgramById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const loyaltyProgram = await loyaltyProgramService.getLoyaltyProgramById(id);
    if (loyaltyProgram) {
      res.status(200).json(loyaltyProgram);
    } else {
      res.status(404).json({ error: 'Loyalty program not found' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch loyalty program', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch loyalty program', details: 'An unknown error occurred' });
    }
  }
};

export const updateLoyaltyProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const loyaltyProgram = await loyaltyProgramService.updateLoyaltyProgram(id, req.body);
    res.status(200).json(loyaltyProgram);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to update loyalty program', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update loyalty program', details: 'An unknown error occurred' });
    }
  }
};

export const deleteLoyaltyProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await loyaltyProgramService.deleteLoyaltyProgram(id);
    res.status(204).send(); // No content
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to delete loyalty program', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete loyalty program', details: 'An unknown error occurred' });
    }
  }
};