
import { PrismaClient, Prisma, Merchant, Stamp } from '@prisma/client';

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

export const issueStamp = async (merchantId: string, customerId: string): Promise<Stamp> => {
  // Basic validation: check if merchant and customer exist
  const merchantExists = await prisma.merchant.findUnique({ where: { id: merchantId } });
  const customerExists = await prisma.customer.findUnique({ where: { id: customerId } });

  if (!merchantExists) {
    throw new Error('Merchant not found.');
  }
  if (!customerExists) {
    throw new Error('Customer not found.');
  }

  return prisma.stamp.create({
    data: {
      merchantId,
      customerId,
    },
  });
};
