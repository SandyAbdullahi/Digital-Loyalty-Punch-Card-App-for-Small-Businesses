import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Authentication API', () => {
  const merchantEmail = `merchant_auth_${Date.now()}@example.com`;
  const customerEmail = `customer_auth_${Date.now()}@example.com`;
  const duplicateMerchantEmail = merchantEmail;
  const duplicateCustomerEmail = customerEmail;

  afterAll(async () => {
    await prisma.stamp.deleteMany({
      where: { merchant: { email: merchantEmail } },
    });
    await prisma.customerLoyaltyProgram.deleteMany({
      where: { customer: { email: customerEmail } },
    });
    await prisma.customer.deleteMany({
      where: { email: customerEmail },
    });
    await prisma.merchant.deleteMany({
      where: { email: merchantEmail },
    });
    await prisma.$disconnect();
  });

  describe('Merchant registration & login', () => {
    it('registers a merchant successfully', async () => {
      const response = await request(app)
        .post('/api/merchants')
        .send({
          name: 'Auth Merchant',
          email: merchantEmail,
          password: 'password123',
          businessName: 'Auth Business',
          businessType: 'Cafe',
          location: 'Auth City',
          contact: '555-0123',
        });

      expect(response.status).toBe(201);
      expect(response.body.email).toBe(merchantEmail);
      expect(response.body.businessName).toBe('Auth Business');
      expect(response.body.qrCodeLink).toContain('/join/');
    });

    it('rejects duplicate merchant registrations', async () => {
      const response = await request(app)
        .post('/api/merchants')
        .send({
          name: 'Duplicate Merchant',
          email: duplicateMerchantEmail,
          password: 'password123',
          businessName: 'Duplicate Business',
          businessType: 'Retail',
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to create merchant');
    });

    it('logs in a merchant with correct credentials', async () => {
      const response = await request(app)
        .post('/api/merchants/login')
        .send({
          email: merchantEmail,
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Merchant logged in successfully');
      expect(response.body.merchant.email).toBe(merchantEmail);
    });

    it('rejects merchant login with invalid password', async () => {
      const response = await request(app)
        .post('/api/merchants/login')
        .send({
          email: merchantEmail,
          password: 'wrong-password',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('Customer registration & login', () => {
    it('registers a customer successfully', async () => {
      const response = await request(app)
        .post('/api/customers/register')
        .send({
          email: customerEmail,
          password: 'customerPass123',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Customer registered successfully');
      expect(response.body.customer.email).toBe(customerEmail);
    });

    it('rejects duplicate customer registrations', async () => {
      const response = await request(app)
        .post('/api/customers/register')
        .send({
          email: duplicateCustomerEmail,
          password: 'anotherPass',
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to register customer');
    });

    it('logs in a customer with correct credentials', async () => {
      const response = await request(app)
        .post('/api/customers/login')
        .send({
          email: customerEmail,
          password: 'customerPass123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Customer logged in successfully');
      expect(response.body.customer.email).toBe(customerEmail);
    });

    it('rejects customer login with invalid password', async () => {
      const response = await request(app)
        .post('/api/customers/login')
        .send({
          email: customerEmail,
          password: 'wrong-password',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('rejects customer login when email is not registered', async () => {
      const response = await request(app)
        .post('/api/customers/login')
        .send({
          email: 'not-registered@example.com',
          password: 'does-not-matter',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});
