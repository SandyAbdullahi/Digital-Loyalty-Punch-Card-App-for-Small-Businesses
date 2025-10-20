"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
describe('Loyalty Program Flow', () => {
    let merchantId;
    let merchantEmail;
    let loyaltyProgramId;
    let customerId;
    let customerEmail;
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        if (customerId) {
            yield prisma.customerLoyaltyProgram.deleteMany({ where: { customerId } });
            yield prisma.stamp.deleteMany({ where: { customerId } });
        }
        if (loyaltyProgramId) {
            yield prisma.customerLoyaltyProgram.deleteMany({ where: { loyaltyProgramId } });
        }
        if (customerEmail) {
            yield prisma.customer.deleteMany({ where: { email: customerEmail } });
        }
        if (loyaltyProgramId) {
            yield prisma.loyaltyProgram.deleteMany({ where: { id: loyaltyProgramId } });
        }
        if (merchantId) {
            yield prisma.stamp.deleteMany({ where: { merchantId } });
            yield prisma.loyaltyProgram.deleteMany({ where: { merchantId } });
            yield prisma.merchant.deleteMany({ where: { id: merchantId } });
        }
        else if (merchantEmail) {
            yield prisma.merchant.deleteMany({ where: { email: merchantEmail } });
        }
        merchantId = undefined;
        merchantEmail = undefined;
        loyaltyProgramId = undefined;
        customerId = undefined;
        customerEmail = undefined;
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma.$disconnect();
    }));
    it('allows a customer to join a loyalty program created by a merchant', () => __awaiter(void 0, void 0, void 0, function* () {
        merchantEmail = `merchant_flow_${Date.now()}@example.com`;
        const merchantRes = yield (0, supertest_1.default)(app_1.default)
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
        const merchantLoginRes = yield (0, supertest_1.default)(app_1.default)
            .post('/api/merchants/login')
            .send({
            email: merchantEmail,
            password: 'merchantpass123',
        });
        expect(merchantLoginRes.status).toBe(200);
        expect(merchantLoginRes.body.merchant).toMatchObject({ id: merchantId, email: merchantEmail });
        const programRes = yield (0, supertest_1.default)(app_1.default)
            .post('/api/loyalty-programs')
            .send({
            merchantId,
            rewardName: 'Flow Reward',
            threshold: 8,
        });
        expect(programRes.status).toBe(201);
        loyaltyProgramId = programRes.body.id;
        customerEmail = `customer_flow_${Date.now()}@example.com`;
        const customerRegisterRes = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/register')
            .send({
            email: customerEmail,
            password: 'customerpass123',
        });
        expect(customerRegisterRes.status).toBe(201);
        const customerLoginRes = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/login')
            .send({
            email: customerEmail,
            password: 'customerpass123',
        });
        expect(customerLoginRes.status).toBe(200);
        expect(customerLoginRes.body.customer).toHaveProperty('id');
        customerId = customerLoginRes.body.customer.id;
        const joinRes = yield (0, supertest_1.default)(app_1.default)
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
    }));
});
