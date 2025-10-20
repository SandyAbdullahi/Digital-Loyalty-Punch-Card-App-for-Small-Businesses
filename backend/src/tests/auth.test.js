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
describe('Authentication API', () => {
    const merchantEmail = `merchant_auth_${Date.now()}@example.com`;
    const customerEmail = `customer_auth_${Date.now()}@example.com`;
    const duplicateMerchantEmail = merchantEmail;
    const duplicateCustomerEmail = customerEmail;
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma.stamp.deleteMany({
            where: { merchant: { email: merchantEmail } },
        });
        yield prisma.customerLoyaltyProgram.deleteMany({
            where: { customer: { email: customerEmail } },
        });
        yield prisma.customer.deleteMany({
            where: { email: customerEmail },
        });
        yield prisma.merchant.deleteMany({
            where: { email: merchantEmail },
        });
        yield prisma.$disconnect();
    }));
    describe('Merchant registration & login', () => {
        it('registers a merchant successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
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
        }));
        it('rejects duplicate merchant registrations', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
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
        }));
        it('logs in a merchant with correct credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/merchants/login')
                .send({
                email: merchantEmail,
                password: 'password123',
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Merchant logged in successfully');
            expect(response.body.merchant.email).toBe(merchantEmail);
        }));
        it('rejects merchant login with invalid password', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/merchants/login')
                .send({
                email: merchantEmail,
                password: 'wrong-password',
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid credentials');
        }));
    });
    describe('Customer registration & login', () => {
        it('registers a customer successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/customers/register')
                .send({
                email: customerEmail,
                password: 'customerPass123',
            });
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Customer registered successfully');
            expect(response.body.customer.email).toBe(customerEmail);
        }));
        it('rejects duplicate customer registrations', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/customers/register')
                .send({
                email: duplicateCustomerEmail,
                password: 'anotherPass',
            });
            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Failed to register customer');
        }));
        it('logs in a customer with correct credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/customers/login')
                .send({
                email: customerEmail,
                password: 'customerPass123',
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Customer logged in successfully');
            expect(response.body.customer.email).toBe(customerEmail);
        }));
        it('rejects customer login with invalid password', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/customers/login')
                .send({
                email: customerEmail,
                password: 'wrong-password',
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid credentials');
        }));
        it('rejects customer login when email is not registered', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/customers/login')
                .send({
                email: 'not-registered@example.com',
                password: 'does-not-matter',
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid credentials');
        }));
    });
});
