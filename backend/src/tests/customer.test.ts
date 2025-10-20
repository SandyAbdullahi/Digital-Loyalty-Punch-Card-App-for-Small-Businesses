import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Customer API', () => {
  let customer: any;
  let merchant: any;
  let loyaltyProgram: any;
  let linkJoinCustomer: any;

  beforeAll(async () => {
    const targetCustomerEmails = ['customer_reg@example.com', 'link_join@example.com'];
    const existingCustomers = await prisma.customer.findMany({
      where: { email: { in: targetCustomerEmails } },
      select: { id: true },
    });

    const customerIds = existingCustomers.map((c) => c.id);

    if (customerIds.length > 0) {
      await prisma.customerLoyaltyProgram.deleteMany({
        where: { customerId: { in: customerIds } },
      });
      await prisma.stamp.deleteMany({
        where: { customerId: { in: customerIds } },
      });
      await prisma.customer.deleteMany({
        where: { id: { in: customerIds } },
      });
    }

    const existingMerchants = await prisma.merchant.findMany({
      where: { email: 'loyalty_merchant@example.com' },
      select: { id: true },
    });

    const merchantIds = existingMerchants.map((m) => m.id);

    if (merchantIds.length > 0) {
      const merchantPrograms = await prisma.loyaltyProgram.findMany({
        where: { merchantId: { in: merchantIds } },
        select: { id: true },
      });
      const programIds = merchantPrograms.map((lp) => lp.id);

      if (programIds.length > 0) {
        await prisma.customerLoyaltyProgram.deleteMany({
          where: { loyaltyProgramId: { in: programIds } },
        });
      }

      await prisma.stamp.deleteMany({
        where: { merchantId: { in: merchantIds } },
      });
      await prisma.loyaltyProgram.deleteMany({
        where: { merchantId: { in: merchantIds } },
      });
      await prisma.subscription.deleteMany({
        where: { merchantId: { in: merchantIds } },
      });
      await prisma.merchant.deleteMany({
        where: { id: { in: merchantIds } },
      });
    }

    // Create a merchant for testing loyalty program joining
    merchant = await prisma.merchant.create({
      data: {
        name: 'Loyalty Merchant',
        email: 'loyalty_merchant@example.com',
        password: 'password123',
        businessName: 'Loyalty Business',
        businessType: 'Cafe',
      },
    });

    merchant = await prisma.merchant.update({
      where: { id: merchant.id },
      data: {
        qrCodeLink: `/join/${merchant.id}`,
      },
    });

    loyaltyProgram = await prisma.loyaltyProgram.create({
      data: {
        rewardName: 'Free Coffee',
        threshold: 5,
        merchant: {
          connect: { id: merchant.id },
        },
      },
    });
  });

  afterAll(async () => {
    const cleanupCustomerIds = [linkJoinCustomer?.id, customer?.id].filter(Boolean) as string[];
    if (cleanupCustomerIds.length > 0) {
      await prisma.customerLoyaltyProgram.deleteMany({
        where: { customerId: { in: cleanupCustomerIds } },
      });
      await prisma.stamp.deleteMany({
        where: { customerId: { in: cleanupCustomerIds } },
      });
      await prisma.customer.deleteMany({
        where: { id: { in: cleanupCustomerIds } },
      });
    }

    if (loyaltyProgram) {
      await prisma.customerLoyaltyProgram.deleteMany({
        where: { loyaltyProgramId: loyaltyProgram.id },
      });
      await prisma.loyaltyProgram.delete({ where: { id: loyaltyProgram.id } });
    }

    if (merchant) {
      await prisma.stamp.deleteMany({ where: { merchantId: merchant.id } });
      await prisma.subscription.deleteMany({ where: { merchantId: merchant.id } });
      await prisma.merchant.delete({ where: { id: merchant.id } });
    }
    await prisma.$disconnect();
  });

  it('should register a new customer', async () => {
    const newCustomer = {
      email: 'customer_reg@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/customers/register')
      .send(newCustomer);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Customer registered successfully');
    expect(response.body.customer.email).toBe(newCustomer.email);
    customer = response.body.customer;
  });

  it('should log in an existing customer', async () => {
    const customerCredentials = {
      email: 'customer_reg@example.com',
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/customers/login')
      .send(customerCredentials);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Customer logged in successfully');
    expect(response.body.customer.email).toBe(customerCredentials.email);
  });

  it('should not log in with invalid credentials', async () => {
    const customerCredentials = {
      email: 'customer_reg@example.com',
      password: 'wrongpassword',
    };

    const response = await request(app)
      .post('/api/customers/login')
      .send(customerCredentials);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid credentials');
  });

  it(`should allow a customer to join a merchant's loyalty program`, async () => {
    const joinData = {
      customerId: customer.id,
      programIdentifier: merchant.id,
    };

    const response = await request(app)
      .post('/api/customers/join-program')
      .send(joinData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Successfully joined loyalty program');
    expect(response.body.stamp.customerId).toBe(customer.id);
    expect(response.body.stamp.merchantId).toBe(merchant.id);
  });

  it(`should allow a customer to join using a loyalty program ID`, async () => {
    const response = await request(app)
      .post('/api/customers/join-program')
      .send({
        customerId: customer.id,
        programIdentifier: loyaltyProgram.id,
      });

    expect(response.status).toBe(200);
    expect(response.body.loyaltyProgramId).toBe(loyaltyProgram.id);
    expect(response.body.stamp.customerId).toBe(customer.id);
    expect(response.body.stamp.merchantId).toBe(merchant.id);
  });

  it(`should not allow a customer to join the same loyalty program twice`, async () => {
    const response = await request(app)
      .post('/api/customers/join-program')
      .send({
        customerId: customer.id,
        programIdentifier: loyaltyProgram.id,
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toContain('Customer already joined this loyalty program.');
  });

  it(`should not allow a customer to join the same program twice`, async () => {
    const joinData = {
      customerId: customer.id,
      programIdentifier: merchant.id,
    };

    const response = await request(app)
      .post('/api/customers/join-program')
      .send(joinData);

    expect(response.status).toBe(409); // Expecting an error due to duplicate join
    expect(response.body.error).toContain(`Customer has already joined this merchant's loyalty program.`);
  });

  it(`should allow joining via a QR code URL`, async () => {
    linkJoinCustomer = await prisma.customer.create({
      data: {
        email: 'link_join@example.com',
        password: 'password123',
      },
    });

    const merchantWithQr = await prisma.merchant.findUnique({
      where: { id: merchant.id },
    });

    expect(merchantWithQr?.qrCodeLink).toBeDefined();

    const qrJoinLink = `http://localhost:5173${merchantWithQr?.qrCodeLink}`;

    const response = await request(app)
      .post('/api/customers/join-program')
      .send({
        customerId: linkJoinCustomer.id,
        programIdentifier: qrJoinLink,
      });

    expect(response.status).toBe(200);
    expect(response.body.stamp.customerId).toBe(linkJoinCustomer.id);
    expect(response.body.stamp.merchantId).toBe(merchant.id);
  });

  it('should fetch customer stamps', async () => {
    const response = await request(app).get(`/api/customers/${customer.id}/stamps`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].customerId).toBe(customer.id);
  });
});
