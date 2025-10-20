import { PrismaClient, Prisma, Customer, Stamp } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendPushNotification } from '../services/notificationService';

const prisma = new PrismaClient();

export const createCustomer = async (data: Prisma.CustomerCreateInput): Promise<Customer> => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  try {
    return prisma.customer.create({
      data: { ...data, password: hashedPassword },
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error; // Re-throw the error after logging
  }
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
  await sendPushNotification({ customerId, title: 'Reward Redeemed!', body: `Reward '${loyaltyProgram.rewardName}' redeemed successfully!` });

  // In a real application, you might want to record the redemption in a separate table
  // For now, we'll just return a success message.
  return { message: `Reward '${loyaltyProgram.rewardName}' redeemed successfully!` };
};

export const updateCustomerProfile = async (id: string, data: Prisma.CustomerUpdateInput): Promise<Customer> => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password as string, 10);
  }
  return prisma.customer.update({
    where: { id },
    data,
  });
};

export const getCustomersByMerchantId = async (merchantId: string): Promise<Customer[]> => {
  // Find all unique customer IDs that have stamps with this merchant
  const customerStamps = await prisma.stamp.findMany({
    where: { merchantId },
    distinct: ['customerId'],
    select: { customerId: true },
  });

  const customerIds = customerStamps.map(stamp => stamp.customerId);

  // Fetch the customer details for these IDs
  return prisma.customer.findMany({
    where: {
      id: {
        in: customerIds,
      },
    },
    select: { id: true, email: true, createdAt: true }, // Select relevant customer fields
  });
};

export const resolveProgramIdentifierToMerchantId = async (programIdentifier: string): Promise<string> => {
  // First, try to find a LoyaltyProgram with the given ID
  const loyaltyProgram = await prisma.loyaltyProgram.findUnique({
    where: { id: programIdentifier },
    select: { merchantId: true },
  });

  if (loyaltyProgram) {
    return loyaltyProgram.merchantId;
  }

  // If not a LoyaltyProgram ID, try to find a Merchant with the given ID
  const merchant = await prisma.merchant.findUnique({
    where: { id: programIdentifier },
    select: { id: true },
  });

  if (merchant) {
    return merchant.id;
  }

  throw new Error('Invalid program identifier: No matching loyalty program or merchant found.');
};

export const deleteCustomerStampsForMerchant = async (merchantId: string, customerId: string): Promise<void> => {
  await prisma.stamp.deleteMany({
    where: {
      merchantId: merchantId,
      customerId: customerId,
    },
  });
};