import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Customer Join Loyalty Program API', () => {
  let merchant: any;
  let loyaltyProgram: any;
  let customer: any;

  const uniqueSuffix = Date.now();
  const merchantEmail = `join_merchant_${uniqueSuffix}@example.com`;
  const customerEmail = `join_customer_${uniqueSuffix}@example.com`;

  beforeAll(async () => {
    merchant = await prisma.merchant.create({
      data: {
        name: 'Join Merchant',
        email: merchantEmail,
        password: 'password123',
        businessName: 'Join Business',
        businessType: 'Cafe',
      },
    });

    // ensure qr code link stored like service would
    merchant = await prisma.merchant.update({
      where: { id: merchant.id },
      data: { qrCodeLink: `/join/${merchant.id}` },
    });

    loyaltyProgram = await prisma.loyaltyProgram.create({
      data: {
        rewardName: 'Free Muffin',
        threshold: 6,
        merchant: { connect: { id: merchant.id } },
      },
    });

    customer = await prisma.customer.create({
      data: {
        email: customerEmail,
        password: 'password123',
      },
    });
  });

  afterAll(async () => {
    await prisma.customerLoyaltyProgram.deleteMany({
      where: { customerId: customer.id },
    });
    await prisma.stamp.deleteMany({
      where: { customerId: customer.id },
    });
    await prisma.customer.deleteMany({ where: { id: customer.id } });
    await prisma.loyaltyProgram.deleteMany({ where: { id: loyaltyProgram.id } });
    await prisma.merchant.deleteMany({ where: { id: merchant.id } });
    await prisma.$disconnect();
  });

  it('allows a customer to join a loyalty program via direct program ID', async () => {
    const response = await request(app)
      .post('/api/customers/join-program')
      .send({
        customerId: customer.id,
        programIdentifier: loyaltyProgram.id,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Successfully joined loyalty program');
    expect(response.body.loyaltyProgramId).toBe(loyaltyProgram.id);
    expect(response.body.stamp.merchantId).toBe(merchant.id);
  });

  it('prevents the same customer from joining the same loyalty program twice', async () => {
    const duplicate = await request(app)
      .post('/api/customers/join-program')
      .send({
        customerId: customer.id,
        programIdentifier: loyaltyProgram.id,
      });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error).toContain('Customer already joined this loyalty program');
  });

  it('allows joining using a shareable QR link URL', async () => {
    const newCustomer = await prisma.customer.create({
      data: {
        email: `second_join_${uniqueSuffix}@example.com`,
        password: 'password123',
      },
    });

    const response = await request(app)
      .post('/api/customers/join-program')
      .send({
        customerId: newCustomer.id,
        programIdentifier: `http://localhost:5173/join/${loyaltyProgram.id}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.loyaltyProgramId).toBe(loyaltyProgram.id);
    expect(response.body.stamp.customerId).toBe(newCustomer.id);

    await prisma.customerLoyaltyProgram.deleteMany({
      where: { customerId: newCustomer.id },
    });
    await prisma.stamp.deleteMany({ where: { customerId: newCustomer.id } });
    await prisma.customer.delete({ where: { id: newCustomer.id } });
  });

  it('returns 400 when program identifier is missing', async () => {
    const response = await request(app)
      .post('/api/customers/join-program')
      .send({
        customerId: customer.id,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Program identifier is required.');
  });

  it('returns 400 for invalid program identifier', async () => {
    const response = await request(app)
      .post('/api/customers/join-program')
      .send({
        customerId: customer.id,
        programIdentifier: 'non-existent-id',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid program identifier');
  });
});
