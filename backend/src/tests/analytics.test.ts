import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Analytics API', () => {
  let merchant: any;
  let customer: any;
  let loyaltyProgram: any;

  beforeAll(async () => {
    // Create a merchant
    merchant = await prisma.merchant.create({
      data: {
        name: 'Analytics Merchant',
        email: 'analytics@example.com',
        password: 'password123',
        businessName: 'Analytics Business',
        businessType: 'Cafe',
      },
    });

    // Create a customer
    customer = await prisma.customer.create({
      data: {
        email: 'customer@example.com',
        password: 'customerpass',
      },
    });

    // Create a loyalty program for the merchant
    loyaltyProgram = await prisma.loyaltyProgram.create({
      data: {
        rewardName: 'Free Coffee',
        threshold: 5,
        merchant: { connect: { id: merchant.id } },
      },
    });

    // Issue some stamps to the customer from this merchant
    await prisma.stamp.create({
      data: {
        customer: { connect: { id: customer.id } },
        merchant: { connect: { id: merchant.id } },
      },
    });
    await prisma.stamp.create({
      data: {
        customer: { connect: { id: customer.id } },
        merchant: { connect: { id: merchant.id } },
      },
    });

    // Create a reward for the merchant (for counting redeemed rewards)
    await prisma.reward.create({
      data: {
        name: 'Free Drink',
        points: 5,
        merchant: { connect: { id: merchant.id } },
      },
    });
  });

  afterAll(async () => {
    // Clean up created data
    await prisma.stamp.deleteMany({ where: { merchantId: merchant.id } });
    await prisma.reward.deleteMany({ where: { merchantId: merchant.id } });
    await prisma.loyaltyProgram.deleteMany({ where: { merchantId: merchant.id } });
    await prisma.customer.deleteMany({ where: { id: customer.id } });
    await prisma.merchant.deleteMany({ where: { id: merchant.id } });
    await prisma.$disconnect();
  });

  it('should fetch analytics for a merchant', async () => {
    const response = await request(app).get(`/api/analytics/merchant/${merchant.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('customersJoined');
    expect(response.body).toHaveProperty('stampsIssued');
    expect(response.body).toHaveProperty('rewardsRedeemed');

    // Based on the setup in beforeAll
    expect(response.body.customersJoined).toBe(1); 
    expect(response.body.stampsIssued).toBe(2);
    expect(response.body.rewardsRedeemed).toBe(1);
  });
});
