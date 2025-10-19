
import { PrismaClient, Prisma, Merchant } from '@prisma/client';

const prisma = new PrismaClient();

export const createMerchant = async (data: Prisma.MerchantCreateInput): Promise<Merchant> => {
  const merchant = await prisma.merchant.create({
    data,
  });
  
  // Generate QR code link after merchant creation
  const qrCodeLink = `/join/${merchant.id}`;
  return prisma.merchant.update({
    where: { id: merchant.id },
    data: { qrCodeLink },
  });
};

export const updateMerchant = async (id: string, data: Prisma.MerchantUpdateInput): Promise<Merchant> => {
  return prisma.merchant.update({
    where: { id },
    data,
  });
};

export const getMerchantById = async (id: string): Promise<Merchant | null> => {
  return prisma.merchant.findUnique({
    where: { id },
  });
};

export const getAllMerchants = async (): Promise<Merchant[]> => {
  return prisma.merchant.findMany();
};
