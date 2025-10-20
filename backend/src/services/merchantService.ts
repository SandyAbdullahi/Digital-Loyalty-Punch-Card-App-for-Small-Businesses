
import { PrismaClient, Prisma, Merchant, Stamp } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendPushNotification } from '../services/notificationService';

const prisma = new PrismaClient();

export const createMerchant = async (data: Prisma.MerchantCreateInput): Promise<Merchant> => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const merchant = await prisma.merchant.create({
    data: { ...data, password: hashedPassword },
  });
  
  // Generate QR code link after merchant creation
  const qrCodeLink = `/join/${merchant.id}`;
  return prisma.merchant.update({
    where: { id: merchant.id },
    data: { qrCodeLink },
  });
};

export const loginMerchant = async (email: string, password: string): Promise<Merchant> => {
  const merchant = await prisma.merchant.findUnique({
    where: { email },
  });

  if (!merchant) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, merchant.password);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  return merchant;
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

  const stamp = await prisma.stamp.create({
    data: {
      merchantId,
      customerId,
    },
  });

  // Send notification to customer
  await sendPushNotification({ customerId, title: 'Stamp Earned!', body: 'You just earned a stamp!' });

  return stamp;
};

export const getCustomersByMerchantId = async (merchantId: string) => {
  const customerStamps = await prisma.stamp.findMany({
    where: { merchantId },
    select: { customer: true },
    distinct: ['customerId'],
  });
  return customerStamps.map(cs => cs.customer);
};

export const updateMerchantSubscription = async (id: string, subscriptionPlan: string): Promise<Merchant> => {
  return prisma.merchant.update({
    where: { id },
    data: { subscriptionPlan },
  });
};

export const getNearbyMerchants = async (location: string): Promise<Merchant[]> => {
  return prisma.merchant.findMany({
    where: {
      location: {
        contains: location, // Case-insensitive search for location
      },
    },
  });
};
