import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMerchantAnalytics = async (merchantId: string) => {
  const customersJoined = await prisma.customer.count({
    where: {
      stamps: {
        some: {
          merchantId: merchantId,
        },
      },
    },
  });

  const stampsIssued = await prisma.stamp.count({
    where: {
      merchantId: merchantId,
    },
  });

  // This assumes a 'redeemed' status or similar for rewards. 
  // For MVP, we'll count rewards associated with the merchant.
  const rewardsRedeemed = await prisma.reward.count({
    where: {
      merchantId: merchantId,
    },
  });

  return {
    customersJoined,
    stampsIssued,
    rewardsRedeemed,
  };
};