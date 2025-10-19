import { PrismaClient, Prisma, LoyaltyProgram } from '@prisma/client';

const prisma = new PrismaClient();

export const createLoyaltyProgram = async (data: Prisma.LoyaltyProgramCreateInput): Promise<LoyaltyProgram> => {
  return prisma.loyaltyProgram.create({
    data,
  });
};

export const getLoyaltyProgramsByMerchantId = async (merchantId: string): Promise<LoyaltyProgram[]> => {
  return prisma.loyaltyProgram.findMany({
    where: { merchantId },
  });
};

export const getLoyaltyProgramById = async (id: string): Promise<LoyaltyProgram | null> => {
  return prisma.loyaltyProgram.findUnique({
    where: { id },
  });
};

export const updateLoyaltyProgram = async (id: string, data: Prisma.LoyaltyProgramUpdateInput): Promise<LoyaltyProgram> => {
  return prisma.loyaltyProgram.update({
    where: { id },
    data,
  });
};

export const deleteLoyaltyProgram = async (id: string): Promise<LoyaltyProgram> => {
  return prisma.loyaltyProgram.delete({
    where: { id },
  });
};