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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
describe('Customer Join Loyalty Program API', () => {
    let merchant;
    let loyaltyProgram;
    let customer;
    const uniqueSuffix = Date.now();
    const merchantEmail = `join_merchant_${uniqueSuffix}@example.com`;
    const customerEmail = `join_customer_${uniqueSuffix}@example.com`;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        merchant = yield prisma.merchant.create({
            data: {
                name: 'Join Merchant',
                email: merchantEmail,
                password: 'password123',
                businessName: 'Join Business',
                businessType: 'Cafe',
            },
        });
        // ensure qr code link stored like service would
        merchant = yield prisma.merchant.update({
            where: { id: merchant.id },
            data: { qrCodeLink: `/join/${merchant.id}` },
        });
        loyaltyProgram = yield prisma.loyaltyProgram.create({
            data: {
                rewardName: 'Free Muffin',
                threshold: 6,
                merchant: { connect: { id: merchant.id } },
            },
        });
        customer = yield prisma.customer.create({
            data: {
                email: customerEmail,
                password: 'password123',
            },
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma.customerLoyaltyProgram.deleteMany({
            where: { customerId: customer.id },
        });
        yield prisma.stamp.deleteMany({
            where: { customerId: customer.id },
        });
        yield prisma.customer.deleteMany({ where: { id: customer.id } });
        yield prisma.loyaltyProgram.deleteMany({ where: { id: loyaltyProgram.id } });
        yield prisma.merchant.deleteMany({ where: { id: merchant.id } });
        yield prisma.$disconnect();
    }));
    it('allows a customer to join a loyalty program via direct program ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/join-program')
            .send({
            customerId: customer.id,
            programIdentifier: loyaltyProgram.id,
        });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Successfully joined loyalty program');
        expect(response.body.loyaltyProgramId).toBe(loyaltyProgram.id);
        expect(response.body.stamp.merchantId).toBe(merchant.id);
    }));
    it('prevents the same customer from joining the same loyalty program twice', () => __awaiter(void 0, void 0, void 0, function* () {
        const duplicate = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/join-program')
            .send({
            customerId: customer.id,
            programIdentifier: loyaltyProgram.id,
        });
        expect(duplicate.status).toBe(409);
        expect(duplicate.body.error).toContain('Customer already joined this loyalty program');
    }));
    it('allows joining using a shareable QR link URL', () => __awaiter(void 0, void 0, void 0, function* () {
        const newCustomer = yield prisma.customer.create({
            data: {
                email: `second_join_${uniqueSuffix}@example.com`,
                password: 'password123',
            },
        });
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/join-program')
            .send({
            customerId: newCustomer.id,
            programIdentifier: `http://localhost:5173/join/${loyaltyProgram.id}`,
        });
        expect(response.status).toBe(200);
        expect(response.body.loyaltyProgramId).toBe(loyaltyProgram.id);
        expect(response.body.stamp.customerId).toBe(newCustomer.id);
        yield prisma.customerLoyaltyProgram.deleteMany({
            where: { customerId: newCustomer.id },
        });
        yield prisma.stamp.deleteMany({ where: { customerId: newCustomer.id } });
        yield prisma.customer.delete({ where: { id: newCustomer.id } });
    }));
    it('returns 400 when program identifier is missing', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/join-program')
            .send({
            customerId: customer.id,
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Program identifier is required.');
    }));
    it('returns 400 for invalid program identifier', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/join-program')
            .send({
            customerId: customer.id,
            programIdentifier: 'non-existent-id',
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid program identifier');
    }));
});
