import { PrismaClient, Prisma, Customer, Stamp } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendNotification } from '../services/notificationService';

const prisma = new PrismaClient();

export const createCustomer = async (data: Prisma.CustomerCreateInput): Promise<Customer> => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.customer.create({
    data: { ...data, password: hashedPassword },
  });
};

export const findCustomerByEmail = async (email: string): Promise<Customer | null> => {
  return prisma.customer.findUnique({
    where: { email },
  });
};

export const validatePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const joinMerchantLoyaltyProgram = async (customerId: string, merchantId: string) => {
  // Check if the customer has already joined this merchant's program
  const existingStamp = await prisma.stamp.findFirst({
    where: {
      customerId: customerId,
      merchantId: merchantId,
    },
  });

  if (existingStamp) {
    throw new Error(`Customer has already joined this merchant's loyalty program.`);
  }

  // Create an initial stamp entry to signify joining
  return prisma.stamp.create({
    data: {
      customerId: customerId,
      merchantId: merchantId,
    },
  });
};

export const getCustomerStamps = async (customerId: string): Promise<Stamp[]> => {
  return prisma.stamp.findMany({
    where: { customerId },
  });
};

export const redeemReward = async (customerId: string, loyaltyProgramId: string) => {
  const loyaltyProgram = await prisma.loyaltyProgram.findUnique({
    where: { id: loyaltyProgramId },
  });

  if (!loyaltyProgram) {
    throw new Error('Loyalty program not found.');
  }

  const customerStamps = await prisma.stamp.findMany({
    where: {
      customerId,
      merchantId: loyaltyProgram.merchantId,
    },
  });

  if (customerStamps.length < loyaltyProgram.threshold) {
    throw new Error('Not enough stamps to redeem this reward.');
  }

  // Delete stamps used for redemption
  const stampsToDelete = customerStamps.slice(0, loyaltyProgram.threshold);
  await prisma.stamp.deleteMany({
    where: {
      id: {
        in: stampsToDelete.map(stamp => stamp.id),
      },
    },
  });

  // Send notification to customer
  await sendNotification(customerId, `Reward '${loyaltyProgram.rewardName}' redeemed successfully!`);

  // In a real application, you might want to record the redemption in a separate table
  // For now, we'll just return a success message.
  return { message: `Reward '${loyaltyProgram.rewardName}' redeemed successfully!` };
};