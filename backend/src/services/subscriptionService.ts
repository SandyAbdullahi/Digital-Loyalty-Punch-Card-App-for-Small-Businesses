import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SubscriptionData {
  merchantId: string;
  plan: string;
  status: 'active' | 'cancelled' | 'trialing';
  startDate: Date;
  endDate?: Date;
  // Add more fields as needed for payment gateway integration (e.g., customerId from Stripe)
}

export const createSubscription = async (data: SubscriptionData) => {
  // In a real application, this would interact with a payment gateway (e.g., Stripe, PayPal)
  // to create a subscription and get a subscription ID.
  console.log('Simulating subscription creation for merchant:', data.merchantId, 'Plan:', data.plan);
  const subscription = await prisma.subscription.create({
    data: {
      merchantId: data.merchantId,
      plan: data.plan,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
    },
  });
  return subscription;
};

export const getSubscriptionByMerchantId = async (merchantId: string) => {
  const subscription = await prisma.subscription.findFirst({
    where: { merchantId },
  });
  return subscription;
};

export const updateSubscription = async (id: string, data: Partial<SubscriptionData>) => {
  console.log('Simulating subscription update for ID:', id, 'Data:', data);
  const subscription = await prisma.subscription.update({
    where: { id },
    data,
  });
  return subscription;
};

export const cancelSubscription = async (id: string) => {
  console.log('Simulating subscription cancellation for ID:', id);
  const subscription = await prisma.subscription.update({
    where: { id },
    data: { status: 'cancelled', endDate: new Date() },
  });
  return subscription;
};
