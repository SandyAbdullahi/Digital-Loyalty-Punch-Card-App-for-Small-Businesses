import { PrismaClient, Prisma, Customer, Stamp } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendPushNotification } from '../services/notificationService';

const prisma = new PrismaClient();

interface CustomerListItem {
  id: string;
  email: string;
  createdAt: Date;
}

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

export const joinMerchantLoyaltyProgram = async (
  customerId: string,
  merchantId: string,
  loyaltyProgramId?: string
) => {
  console.log('[customerService.joinMerchantLoyaltyProgram] Start', {
    customerId,
    merchantId,
    loyaltyProgramId,
  });
  // Validate customer and merchant existence
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    console.log('[customerService.joinMerchantLoyaltyProgram] Customer not found', { customerId });
    throw new Error('Customer not found.');
  }

  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
  if (!merchant) {
    console.log('[customerService.joinMerchantLoyaltyProgram] Merchant not found', { merchantId });
    throw new Error('Merchant not found.');
  }

  const existingStamp = await prisma.stamp.findFirst({
    where: {
      customerId,
      merchantId,
    },
  });

  if (loyaltyProgramId) {
    const loyaltyProgram = await prisma.loyaltyProgram.findUnique({
      where: { id: loyaltyProgramId },
      select: { id: true, merchantId: true },
    });

    if (!loyaltyProgram || loyaltyProgram.merchantId !== merchantId) {
      console.log('[customerService.joinMerchantLoyaltyProgram] Loyalty program mismatch', {
        loyaltyProgramId,
        merchantId,
        loyaltyProgramMerchantId: loyaltyProgram?.merchantId,
      });
      throw new Error('Loyalty program not found for this merchant.');
    }

    const existingMembership = await prisma.customerLoyaltyProgram.findUnique({
      where: {
        customerId_loyaltyProgramId: {
          customerId,
          loyaltyProgramId,
        },
      },
    });

    if (existingMembership) {
      console.log('[customerService.joinMerchantLoyaltyProgram] Already joined loyalty program', {
        customerId,
        loyaltyProgramId,
      });
      throw new Error('Customer already joined this loyalty program.');
    }

    await prisma.customerLoyaltyProgram.create({
      data: {
        customerId,
        loyaltyProgramId,
      },
    });

    if (existingStamp) {
      console.log('[customerService.joinMerchantLoyaltyProgram] Using existing stamp record', {
        stampId: existingStamp.id,
      });
      return existingStamp;
    }
  } else if (existingStamp) {
    console.log('[customerService.joinMerchantLoyaltyProgram] Already joined merchant program via stamp', {
      stampId: existingStamp.id,
    });
    throw new Error(`Customer has already joined this merchant's loyalty program.`);
  }

  // Create an initial stamp entry to signify joining
  try {
    const stamp = await prisma.stamp.create({
      data: {
        customer: { connect: { id: customerId } },
        merchant: { connect: { id: merchantId } },
      },
    });
    console.log('[customerService.joinMerchantLoyaltyProgram] Created new stamp entry', {
      stampId: stamp.id,
    });
    return stamp;
  } catch (error) {
    console.error('Error creating stamp:', error);
    throw new Error('Failed to create stamp entry for loyalty program.');
  }
};

export const getCustomerStamps = async (customerId: string): Promise<Stamp[]> => {
  return prisma.stamp.findMany({
    where: { customerId },
  });
};

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  return prisma.customer.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
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

export const getCustomersByMerchantId = async (merchantId: string): Promise<CustomerListItem[]> => {
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

interface ProgramResolution {
  merchantId: string;
  loyaltyProgramId?: string;
}

export const resolveProgramIdentifier = async (programIdentifier: string): Promise<ProgramResolution> => {
  if (!programIdentifier || !programIdentifier.trim()) {
    console.log('[customerService.resolveProgramIdentifier] Empty identifier');
    throw new Error('Invalid program identifier: No value provided.');
  }

  console.log('[customerService.resolveProgramIdentifier] Resolving identifier', { programIdentifier });

  const tryResolveCandidate = async (candidate: string): Promise<ProgramResolution | null> => {
    const trimmed = candidate.trim().replace(/^\/+|\/+$/g, '');

    if (!trimmed || trimmed.toLowerCase() === 'join') {
      return null;
    }

    const loyaltyProgram = await prisma.loyaltyProgram.findUnique({
      where: { id: trimmed },
      select: { merchantId: true, id: true },
    });

    if (loyaltyProgram) {
      return {
        merchantId: loyaltyProgram.merchantId,
        loyaltyProgramId: trimmed,
      };
    }

    const merchant = await prisma.merchant.findUnique({
      where: { id: trimmed },
      select: { id: true },
    });

    if (merchant) {
      return { merchantId: merchant.id };
    }

    return null;
  };

  const attemptQueue: string[] = [];

  const pushCandidate = (value: string | null | undefined) => {
    if (value === null || value === undefined) {
      return;
    }
    let decoded = value;
    try {
      decoded = decodeURIComponent(value);
    } catch {
      decoded = value;
    }
    if (!decoded.trim()) {
      return;
    }
    attemptQueue.push(decoded);
  };

  pushCandidate(programIdentifier);

  try {
    const parsedUrl = new URL(programIdentifier);
    pushCandidate(parsedUrl.pathname);
    pushCandidate(parsedUrl.pathname.split('/').filter(Boolean).join('/'));
    parsedUrl.pathname
      .split('/')
      .filter(Boolean)
      .forEach((segment) => pushCandidate(segment));
  } catch {
    // Not a valid URL, treat as a raw identifier or path
    programIdentifier
      .split('/')
      .filter(Boolean)
      .forEach((segment) => pushCandidate(segment));
  }

  const visited = new Set<string>();

  for (const candidate of attemptQueue) {
    if (visited.has(candidate)) {
      continue;
    }
    visited.add(candidate);
    console.log('[customerService.resolveProgramIdentifier] Trying candidate', { candidate });
    const resolved = await tryResolveCandidate(candidate);
    if (resolved) {
      console.log('[customerService.resolveProgramIdentifier] Resolved candidate', resolved);
      return resolved;
    }
  }

  console.log('[customerService.resolveProgramIdentifier] Failed to resolve identifier');
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

export const getCustomerHistoryForMerchant = async (merchantId: string, customerId: string) => {
  const stamps = await prisma.stamp.findMany({
    where: {
      merchantId: merchantId,
      customerId: customerId,
    },
    orderBy: { createdAt: 'asc' },
  });

  // In a more complete system, you would also fetch reward redemptions here
  // For now, we only return stamps.
  return { stamps };
};
