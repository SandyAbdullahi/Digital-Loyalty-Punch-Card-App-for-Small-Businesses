import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import * as loyaltyProgramService from '../services/loyaltyProgramService';
import { generateQrCode } from '../services/qrCodeService';

const buildJoinUrl = (loyaltyProgramId: string) => {
  const base = process.env.FRONTEND_URL?.trim();
  if (!base) {
    return `/join/${loyaltyProgramId}`;
  }
  const sanitizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${sanitizedBase}/join/${loyaltyProgramId}`;
};

export const createLoyaltyProgram = async (req: Request, res: Response) => {
  try {
    const { merchantId, rewardName, threshold, expiryDate } = req.body;

    if (!merchantId || !rewardName || threshold === undefined || threshold === null) {
      return res.status(400).json({ error: 'merchantId, rewardName and threshold are required.' });
    }

    const numericThreshold = Number(threshold);
    if (Number.isNaN(numericThreshold) || numericThreshold <= 0) {
      return res.status(400).json({ error: 'threshold must be a positive number.' });
    }

    let parsedExpiryDate: Date | undefined;
    if (expiryDate !== undefined && expiryDate !== null && expiryDate !== '') {
      const candidate = new Date(expiryDate);
      if (Number.isNaN(candidate.getTime())) {
        return res.status(400).json({ error: 'expiryDate is invalid.' });
      }
      parsedExpiryDate = candidate;
    }

    const createData: Prisma.LoyaltyProgramCreateInput = {
      rewardName,
      threshold: numericThreshold,
      merchant: { connect: { id: merchantId } },
      ...(parsedExpiryDate ? { expiryDate: parsedExpiryDate } : {}),
    };

    const loyaltyProgram = await loyaltyProgramService.createLoyaltyProgram(createData);

    const joinUrl = buildJoinUrl(loyaltyProgram.id);
    const qrCodeDataUrl = await generateQrCode(joinUrl);
    const updatedProgram = await loyaltyProgramService.updateLoyaltyProgram(loyaltyProgram.id, {
      qrCodeDataUrl,
    });

    res.status(201).json({ ...updatedProgram, joinUrl });
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
    const { rewardName, threshold, expiryDate } = req.body;

    const updateData: Prisma.LoyaltyProgramUpdateInput = {};

    if (rewardName !== undefined) {
      updateData.rewardName = rewardName;
    }

    if (threshold !== undefined) {
      const numericThreshold = Number(threshold);
      if (Number.isNaN(numericThreshold) || numericThreshold <= 0) {
        return res.status(400).json({ error: 'threshold must be a positive number.' });
      }
      updateData.threshold = numericThreshold;
    }

    if (expiryDate !== undefined) {
      if (expiryDate === null || expiryDate === '') {
        updateData.expiryDate = null;
      } else {
        const candidate = new Date(expiryDate);
        if (Number.isNaN(candidate.getTime())) {
          return res.status(400).json({ error: 'expiryDate is invalid.' });
        }
        updateData.expiryDate = candidate;
      }
    }

    const loyaltyProgram = await loyaltyProgramService.updateLoyaltyProgram(id, updateData);
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
      if (error.message.includes('Foreign key constraint')) {
        res.status(400).json({ error: 'Failed to delete loyalty program', details: 'Program has associated customers or stamps. Remove them before deleting.' });
      } else {
        res.status(500).json({ error: 'Failed to delete loyalty program', details: error.message });
      }
    } else {
      res.status(500).json({ error: 'Failed to delete loyalty program', details: 'An unknown error occurred' });
    }
  }
};

export const getLoyaltyProgramQrCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const loyaltyProgram = await loyaltyProgramService.getLoyaltyProgramById(id);

    if (!loyaltyProgram) {
      return res.status(404).json({ error: 'Loyalty program not found' });
    }

    const joinUrl = buildJoinUrl(loyaltyProgram.id);
    let qrCodeDataUrl = loyaltyProgram.qrCodeDataUrl;

    if (!qrCodeDataUrl) {
      qrCodeDataUrl = await generateQrCode(joinUrl);
      await loyaltyProgramService.updateLoyaltyProgram(id, { qrCodeDataUrl });
    }

    res.status(200).json({ qrCodeImage: qrCodeDataUrl, joinUrl });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to retrieve QR code', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to retrieve QR code', details: 'An unknown error occurred' });
    }
  }
};

export const joinLoyaltyProgram = async (req: Request, res: Response) => {
  try {
    const { customerId, loyaltyProgramId } = req.body;
    const customerLoyaltyProgram = await loyaltyProgramService.joinLoyaltyProgram(customerId, loyaltyProgramId);
    res.status(200).json(customerLoyaltyProgram);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error joining loyalty program:', error.message);
      res.status(500).json({ error: 'Failed to join loyalty program', details: error.message });
    } else {
      console.error('Unknown error joining loyalty program:', error);
      res.status(500).json({ error: 'Failed to join loyalty program', details: 'An unknown error occurred' });
    }
  }
};
