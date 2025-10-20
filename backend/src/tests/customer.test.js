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
describe('Customer API', () => {
    let customer;
    let merchant;
    let loyaltyProgram;
    let linkJoinCustomer;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const targetCustomerEmails = ['customer_reg@example.com', 'link_join@example.com'];
        const existingCustomers = yield prisma.customer.findMany({
            where: { email: { in: targetCustomerEmails } },
            select: { id: true },
        });
        const customerIds = existingCustomers.map((c) => c.id);
        if (customerIds.length > 0) {
            yield prisma.customerLoyaltyProgram.deleteMany({
                where: { customerId: { in: customerIds } },
            });
            yield prisma.stamp.deleteMany({
                where: { customerId: { in: customerIds } },
            });
            yield prisma.customer.deleteMany({
                where: { id: { in: customerIds } },
            });
        }
        const existingMerchants = yield prisma.merchant.findMany({
            where: { email: 'loyalty_merchant@example.com' },
            select: { id: true },
        });
        const merchantIds = existingMerchants.map((m) => m.id);
        if (merchantIds.length > 0) {
            const merchantPrograms = yield prisma.loyaltyProgram.findMany({
                where: { merchantId: { in: merchantIds } },
                select: { id: true },
            });
            const programIds = merchantPrograms.map((lp) => lp.id);
            if (programIds.length > 0) {
                yield prisma.customerLoyaltyProgram.deleteMany({
                    where: { loyaltyProgramId: { in: programIds } },
                });
            }
            yield prisma.stamp.deleteMany({
                where: { merchantId: { in: merchantIds } },
            });
            yield prisma.loyaltyProgram.deleteMany({
                where: { merchantId: { in: merchantIds } },
            });
            yield prisma.subscription.deleteMany({
                where: { merchantId: { in: merchantIds } },
            });
            yield prisma.merchant.deleteMany({
                where: { id: { in: merchantIds } },
            });
        }
        // Create a merchant for testing loyalty program joining
        merchant = yield prisma.merchant.create({
            data: {
                name: 'Loyalty Merchant',
                email: 'loyalty_merchant@example.com',
                password: 'password123',
                businessName: 'Loyalty Business',
                businessType: 'Cafe',
            },
        });
        merchant = yield prisma.merchant.update({
            where: { id: merchant.id },
            data: {
                qrCodeLink: `/join/${merchant.id}`,
            },
        });
        loyaltyProgram = yield prisma.loyaltyProgram.create({
            data: {
                rewardName: 'Free Coffee',
                threshold: 5,
                merchant: {
                    connect: { id: merchant.id },
                },
            },
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const cleanupCustomerIds = [linkJoinCustomer === null || linkJoinCustomer === void 0 ? void 0 : linkJoinCustomer.id, customer === null || customer === void 0 ? void 0 : customer.id].filter(Boolean);
        if (cleanupCustomerIds.length > 0) {
            yield prisma.customerLoyaltyProgram.deleteMany({
                where: { customerId: { in: cleanupCustomerIds } },
            });
            yield prisma.stamp.deleteMany({
                where: { customerId: { in: cleanupCustomerIds } },
            });
            yield prisma.customer.deleteMany({
                where: { id: { in: cleanupCustomerIds } },
            });
        }
        if (loyaltyProgram) {
            yield prisma.customerLoyaltyProgram.deleteMany({
                where: { loyaltyProgramId: loyaltyProgram.id },
            });
            yield prisma.loyaltyProgram.delete({ where: { id: loyaltyProgram.id } });
        }
        if (merchant) {
            yield prisma.stamp.deleteMany({ where: { merchantId: merchant.id } });
            yield prisma.subscription.deleteMany({ where: { merchantId: merchant.id } });
            yield prisma.merchant.delete({ where: { id: merchant.id } });
        }
        yield prisma.$disconnect();
    }));
    it('should register a new customer', () => __awaiter(void 0, void 0, void 0, function* () {
        const newCustomer = {
            email: 'customer_reg@example.com',
            password: 'password123',
        };
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/register')
            .send(newCustomer);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Customer registered successfully');
        expect(response.body.customer.email).toBe(newCustomer.email);
        customer = response.body.customer;
    }));
    it('should log in an existing customer', () => __awaiter(void 0, void 0, void 0, function* () {
        const customerCredentials = {
            email: 'customer_reg@example.com',
            password: 'password123',
        };
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/login')
            .send(customerCredentials);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Customer logged in successfully');
        expect(response.body.customer.email).toBe(customerCredentials.email);
    }));
    it('should not log in with invalid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
        const customerCredentials = {
            email: 'customer_reg@example.com',
            password: 'wrongpassword',
        };
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/login')
            .send(customerCredentials);
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid credentials');
    }));
    it(`should allow a customer to join a merchant's loyalty program`, () => __awaiter(void 0, void 0, void 0, function* () {
        const joinData = {
            customerId: customer.id,
            programIdentifier: merchant.id,
        };
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/join-program')
            .send(joinData);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Successfully joined loyalty program');
        expect(response.body.stamp.customerId).toBe(customer.id);
        expect(response.body.stamp.merchantId).toBe(merchant.id);
    }));
    it(`should allow a customer to join using a loyalty program ID`, () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/join-program')
            .send({
            customerId: customer.id,
            programIdentifier: loyaltyProgram.id,
        });
        expect(response.status).toBe(200);
        expect(response.body.loyaltyProgramId).toBe(loyaltyProgram.id);
        expect(response.body.stamp.customerId).toBe(customer.id);
        expect(response.body.stamp.merchantId).toBe(merchant.id);
    }));
    it(`should not allow a customer to join the same loyalty program twice`, () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/join-program')
            .send({
            customerId: customer.id,
            programIdentifier: loyaltyProgram.id,
        });
        expect(response.status).toBe(409);
        expect(response.body.error).toContain('Customer already joined this loyalty program.');
    }));
    it(`should not allow a customer to join the same program twice`, () => __awaiter(void 0, void 0, void 0, function* () {
        const joinData = {
            customerId: customer.id,
            programIdentifier: merchant.id,
        };
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/join-program')
            .send(joinData);
        expect(response.status).toBe(409); // Expecting an error due to duplicate join
        expect(response.body.error).toContain(`Customer has already joined this merchant's loyalty program.`);
    }));
    it(`should allow joining via a QR code URL`, () => __awaiter(void 0, void 0, void 0, function* () {
        linkJoinCustomer = yield prisma.customer.create({
            data: {
                email: 'link_join@example.com',
                password: 'password123',
            },
        });
        const merchantWithQr = yield prisma.merchant.findUnique({
            where: { id: merchant.id },
        });
        expect(merchantWithQr === null || merchantWithQr === void 0 ? void 0 : merchantWithQr.qrCodeLink).toBeDefined();
        const qrJoinLink = `http://localhost:5173${merchantWithQr === null || merchantWithQr === void 0 ? void 0 : merchantWithQr.qrCodeLink}`;
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/customers/join-program')
            .send({
            customerId: linkJoinCustomer.id,
            programIdentifier: qrJoinLink,
        });
        expect(response.status).toBe(200);
        expect(response.body.stamp.customerId).toBe(linkJoinCustomer.id);
        expect(response.body.stamp.merchantId).toBe(merchant.id);
    }));
    it('should fetch customer stamps', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).get(`/api/customers/${customer.id}/stamps`);
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].customerId).toBe(customer.id);
    }));
});
