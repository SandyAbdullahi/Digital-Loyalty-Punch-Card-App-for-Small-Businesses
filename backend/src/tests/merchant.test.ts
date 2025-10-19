
import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Merchant API', () => {
  let merchant: any;

  beforeAll(async () => {
    // Create a merchant for testing getAllMerchants
    await prisma.merchant.create({
      data: {
        name: 'Another Test Merchant',
        email: 'another@example.com',
        password: 'password123',
        businessName: 'Another Business',
        businessType: 'Retail',
      },
    });
  });

  afterAll(async () => {
    if (merchant) {
      await prisma.merchant.delete({ where: { id: merchant.id } });
    }
    await prisma.merchant.deleteMany({ where: { email: 'another@example.com' } }); // Clean up the merchant created in beforeAll
    await prisma.$disconnect();
  });

  it('should create a new merchant', async () => {
    const newMerchant = {
      name: 'Test Merchant',
      email: 'test@example.com',
      password: 'password123',
      businessName: 'Test Business',
      businessType: 'Cafe',
      location: 'Test City',
      contact: '123-456-7890',
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
    expect(response.body.businessName).toBe(newMerchant.businessName);
    expect(response.body.businessType).toBe(newMerchant.businessType);
    expect(response.body.location).toBe(newMerchant.location);
    expect(response.body.contact).toBe(newMerchant.contact);
    expect(response.body.qrCodeLink).toBe(`/join/${response.body.id}`);

    merchant = response.body;
  });

  it('should update an existing merchant', async () => {
    const updatedData = {
      name: 'Updated Merchant Name',
      location: 'Updated City',
    };

    const response = await request(app)
      .put(`/api/merchants/${merchant.id}`)
      .send(updatedData);

    if (response.status !== 200) {
      console.error(response.body);
    }
    expect(response.status).toBe(200);
    expect(response.body.name).toBe(updatedData.name);
    expect(response.body.location).toBe(updatedData.location);
    expect(response.body.email).toBe(merchant.email); // Email should remain unchanged
  });

  it('should fetch a merchant by ID', async () => {
    const response = await request(app).get(`/api/merchants/${merchant.id}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(merchant.id);
    expect(response.body.email).toBe(merchant.email);
    expect(response.body.qrCodeLink).toBe(`/join/${merchant.id}`);
  });

  it('should return 404 if merchant is not found', async () => {
    const nonExistentId = 'nonexistentid';
    const response = await request(app).get(`/api/merchants/${nonExistentId}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Merchant not found');
  });

  it('should fetch all merchants', async () => {
    const response = await request(app).get('/api/merchants');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    // Check if the merchant created in beforeAll is present
    expect(response.body.some((m: any) => m.email === 'another@example.com')).toBe(true);
    // Check if the merchant created in the 'should create a new merchant' test is present
    expect(response.body.some((m: any) => m.email === 'test@example.com')).toBe(true);
  });
});
