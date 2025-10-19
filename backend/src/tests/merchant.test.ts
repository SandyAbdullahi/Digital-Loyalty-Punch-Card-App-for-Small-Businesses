
import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('POST /api/merchants', () => {
  let merchant: any;

  afterAll(async () => {
    if (merchant) {
      await prisma.merchant.delete({ where: { id: merchant.id } });
    }
    await prisma.$disconnect();
  });

  it('should create a new merchant', async () => {
    const newMerchant = {
      name: 'Test Merchant',
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/merchants')
      .send(newMerchant);

    if (response.status !== 201) {
      console.error(response.body);
    }
    expect(response.status).toBe(201);
    expect(response.body.name).toBe(newMerchant.name);
    expect(response.body.email).toBe(newMerchant.email);

    merchant = response.body;
  });
});
