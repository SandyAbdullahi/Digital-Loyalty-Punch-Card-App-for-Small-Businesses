import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('LoyaltyProgram API', () => {
  let merchant: any;
  let loyaltyProgram: any;

  beforeAll(async () => {
    // Create a merchant first to associate loyalty programs with
    merchant = await prisma.merchant.create({
      data: {
        name: 'Test Merchant for LP',
        email: 'lp_test@example.com',
        password: 'password123',
        businessName: 'LP Test Business',
        businessType: 'Restaurant',
      },
    });
  });

  afterAll(async () => {
    if (loyaltyProgram) {
      await prisma.loyaltyProgram.delete({ where: { id: loyaltyProgram.id } });
    }
    if (merchant) {
      await prisma.merchant.delete({ where: { id: merchant.id } });
    }
    await prisma.$disconnect();
  });

  it('should create a new loyalty program', async () => {
    const newLoyaltyProgram = {
      merchantId: merchant.id,
      rewardName: 'Free Coffee',
      threshold: 10,
      expiryDate: new Date().toISOString(),
    };

    const response = await request(app)
      .post('/api/loyalty-programs')
      .send(newLoyaltyProgram);

    expect(response.status).toBe(201);
    expect(response.body.rewardName).toBe(newLoyaltyProgram.rewardName);
    expect(response.body.threshold).toBe(newLoyaltyProgram.threshold);
    loyaltyProgram = response.body;
  });

  it('should fetch loyalty programs by merchant ID', async () => {
    const response = await request(app).get(`/api/loyalty-programs/merchant/${merchant.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].merchantId).toBe(merchant.id);
  });

  it('should fetch a loyalty program by ID', async () => {
    const response = await request(app).get(`/api/loyalty-programs/${loyaltyProgram.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(loyaltyProgram.id);
    expect(response.body.rewardName).toBe(loyaltyProgram.rewardName);
  });

  it('should update an existing loyalty program', async () => {
    const updatedData = {
      rewardName: 'Free Large Coffee',
      threshold: 12,
    };

    const response = await request(app)
      .put(`/api/loyalty-programs/${loyaltyProgram.id}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.rewardName).toBe(updatedData.rewardName);
    expect(response.body.threshold).toBe(updatedData.threshold);
  });

  it('should delete a loyalty program', async () => {
    const response = await request(app).delete(`/api/loyalty-programs/${loyaltyProgram.id}`);

    expect(response.status).toBe(204);

    const fetchResponse = await request(app).get(`/api/loyalty-programs/${loyaltyProgram.id}`);
    expect(fetchResponse.status).toBe(404);
    loyaltyProgram = null; // Clear loyaltyProgram after deletion
  });
});