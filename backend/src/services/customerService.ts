import { PrismaClient, Prisma, Customer, Stamp } from '@prisma/client';
import bcrypt from 'bcryptjs';

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