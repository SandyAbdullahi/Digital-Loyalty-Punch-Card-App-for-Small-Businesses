import { PrismaClient, Prisma, LoyaltyProgram, CustomerLoyaltyProgram } from '@prisma/client';

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
  // Find the loyalty program to get its merchantId
  const loyaltyProgram = await prisma.loyaltyProgram.findUnique({
    where: { id },
    select: { merchantId: true },
  });

  if (!loyaltyProgram) {
    throw new Error('Loyalty program not found.');
  }

  // Delete all stamps associated with this merchant (simplification given current schema)
  // Ideally, stamps would be directly linked to a loyalty program.
  await prisma.stamp.deleteMany({
    where: { merchantId: loyaltyProgram.merchantId },
  });

  // Then delete the loyalty program
  return prisma.loyaltyProgram.delete({
    where: { id },
  });
};

export const joinLoyaltyProgram = async (customerId: string, loyaltyProgramId: string) => {
  // Check if loyalty program exists
  const loyaltyProgram = await prisma.loyaltyProgram.findUnique({
    where: { id: loyaltyProgramId },
  });

  if (!loyaltyProgram) {
    throw new Error('Loyalty program not found.');
  }

  // Check if customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new Error('Customer not found.');
  }

  // Check if customer has already joined this loyalty program
  const existingEntry = await prisma.customerLoyaltyProgram.findUnique({
    where: {
      customerId_loyaltyProgramId: {
        customerId,
        loyaltyProgramId,
      },
    },
  });

  if (existingEntry) {
    throw new Error('Customer already joined this loyalty program.');
  }

  const newEntry = await prisma.customerLoyaltyProgram.create({
    data: {
      customerId,
      loyaltyProgramId,
    },
  });
  return newEntry;
};