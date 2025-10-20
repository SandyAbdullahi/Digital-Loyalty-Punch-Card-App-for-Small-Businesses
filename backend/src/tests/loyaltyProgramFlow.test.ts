import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Loyalty Program Flow', () => {
  let merchantId: string | undefined;
  let merchantEmail: string | undefined;
  let loyaltyProgramId: string | undefined;
  let customerId: string | undefined;
  let customerEmail: string | undefined;

  afterEach(async () => {
    if (customerId) {
      await prisma.customerLoyaltyProgram.deleteMany({ where: { customerId } });
      await prisma.stamp.deleteMany({ where: { customerId } });
    }

    if (loyaltyProgramId) {
      await prisma.customerLoyaltyProgram.deleteMany({ where: { loyaltyProgramId } });
    }

    if (customerEmail) {
      await prisma.customer.deleteMany({ where: { email: customerEmail } });
    }

    if (loyaltyProgramId) {
      await prisma.loyaltyProgram.deleteMany({ where: { id: loyaltyProgramId } });
    }

    if (merchantId) {
      await prisma.stamp.deleteMany({ where: { merchantId } });
      await prisma.loyaltyProgram.deleteMany({ where: { merchantId } });
      await prisma.merchant.deleteMany({ where: { id: merchantId } });
    } else if (merchantEmail) {
      await prisma.merchant.deleteMany({ where: { email: merchantEmail } });
    }

    merchantId = undefined;
    merchantEmail = undefined;
    loyaltyProgramId = undefined;
    customerId = undefined;
    customerEmail = undefined;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('allows a customer to join a loyalty program created by a merchant', async () => {
    merchantEmail = `merchant_flow_${Date.now()}@example.com`;

    const merchantRes = await request(app)
      .post('/api/merchants')
      .send({
        name: 'Flow Merchant',
        email: merchantEmail,
        password: 'merchantpass123',
        businessName: 'Flow Business',
        businessType: 'Cafe',
        location: 'Flow City',
        contact: '123-456-7890',
      });

    expect(merchantRes.status).toBe(201);
    merchantId = merchantRes.body.id;

    const merchantLoginRes = await request(app)
      .post('/api/merchants/login')
      .send({
        email: merchantEmail,
        password: 'merchantpass123',
      });

    expect(merchantLoginRes.status).toBe(200);
    expect(merchantLoginRes.body.merchant).toMatchObject({ id: merchantId, email: merchantEmail });

    const programRes = await request(app)
      .post('/api/loyalty-programs')
      .send({
        merchantId,
        rewardName: 'Flow Reward',
        threshold: 8,
      });

    expect(programRes.status).toBe(201);
    loyaltyProgramId = programRes.body.id;

    customerEmail = `customer_flow_${Date.now()}@example.com`;

    const customerRegisterRes = await request(app)
      .post('/api/customers/register')
      .send({
        email: customerEmail,
        password: 'customerpass123',
      });

    expect(customerRegisterRes.status).toBe(201);

    const customerLoginRes = await request(app)
      .post('/api/customers/login')
      .send({
        email: customerEmail,
        password: 'customerpass123',
      });

    expect(customerLoginRes.status).toBe(200);
    expect(customerLoginRes.body.customer).toHaveProperty('id');
    customerId = customerLoginRes.body.customer.id;

    const joinRes = await request(app)
      .post('/api/customers/join-program')
      .send({
        customerId,
        programIdentifier: loyaltyProgramId,
      });

    expect(joinRes.status).toBe(200);
    expect(joinRes.body.message).toBe('Successfully joined loyalty program');
    expect(joinRes.body.stamp.customerId).toBe(customerId);
    expect(joinRes.body.stamp.merchantId).toBe(merchantId);
    expect(joinRes.body.loyaltyProgramId).toBe(loyaltyProgramId);
  });
});
