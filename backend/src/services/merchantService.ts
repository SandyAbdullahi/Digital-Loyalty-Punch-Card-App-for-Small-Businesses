
import { PrismaClient } from '@prisma/client';
import { Merchant } from '@prisma/client';

const prisma = new PrismaClient();

export const createMerchant = async (data: Omit<Merchant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Merchant> => {
  return prisma.merchant.create({
    data,
  });
};
