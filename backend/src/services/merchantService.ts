
import { PrismaClient, Prisma, Merchant } from '@prisma/client';

const prisma = new PrismaClient();

export const createMerchant = async (data: Prisma.MerchantCreateInput): Promise<Merchant> => {
  return prisma.merchant.create({
    data,
  });
};
