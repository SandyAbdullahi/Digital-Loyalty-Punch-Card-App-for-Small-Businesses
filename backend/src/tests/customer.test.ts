import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Customer API', () => {
  let customer: any;
  let merchant: any;

  beforeAll(async () => {
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
  });

  afterAll(async () => {
    if (customer) {
      await prisma.stamp.deleteMany({ where: { customerId: customer.id } });
      await prisma.customer.delete({ where: { id: customer.id } });
    }
    if (merchant) {
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
      merchantId: merchant.id,
    };

    const response = await request(app)
      .post('/api/customers/join-program')
      .send(joinData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Successfully joined loyalty program');
    expect(response.body.stamp.customerId).toBe(customer.id);
    expect(response.body.stamp.merchantId).toBe(merchant.id);
  });

  it(`should not allow a customer to join the same program twice`, async () => {
    const joinData = {
      customerId: customer.id,
      merchantId: merchant.id,
    };

    const response = await request(app)
      .post('/api/customers/join-program')
      .send(joinData);

    expect(response.status).toBe(500); // Expecting an error due to duplicate join
    expect(response.body.details).toContain(`Customer has already joined this merchant's loyalty program.`);
  });

  it('should fetch customer stamps', async () => {
    const response = await request(app).get(`/api/customers/${customer.id}/stamps`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].customerId).toBe(customer.id);
  });
});