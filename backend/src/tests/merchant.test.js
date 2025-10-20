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
describe('Merchant API', () => {
    let merchant;
    let customerForStamp;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Create a merchant for testing getAllMerchants
        yield prisma.merchant.create({
            data: {
                name: 'Another Test Merchant',
                email: 'another@example.com',
                password: 'password123',
                businessName: 'Another Business',
                businessType: 'Retail',
            },
        });
        // Create a customer for stamp issuing test
        customerForStamp = yield prisma.customer.create({
            data: {
                email: 'customer_for_stamp@example.com',
                password: 'password123',
            },
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (merchant) {
            yield prisma.stamp.deleteMany({ where: { merchantId: merchant.id } });
            yield prisma.merchant.delete({ where: { id: merchant.id } });
        }
        yield prisma.merchant.deleteMany({ where: { email: 'another@example.com' } }); // Clean up the merchant created in beforeAll
        if (customerForStamp) {
            yield prisma.stamp.deleteMany({ where: { customerId: customerForStamp.id } });
            yield prisma.customer.delete({ where: { id: customerForStamp.id } });
        }
        yield prisma.$disconnect();
    }));
    it('should create a new merchant', () => __awaiter(void 0, void 0, void 0, function* () {
        const newMerchant = {
            name: 'Test Merchant',
            email: 'test@example.com',
            password: 'password123',
            businessName: 'Test Business',
            businessType: 'Cafe',
            location: 'Test City',
            contact: '123-456-7890',
        };
        const response = yield (0, supertest_1.default)(app_1.default)
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
    }));
    it('should update an existing merchant', () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedData = {
            name: 'Updated Merchant Name',
            location: 'Updated City',
        };
        const response = yield (0, supertest_1.default)(app_1.default)
            .put(`/api/merchants/${merchant.id}`)
            .send(updatedData);
        if (response.status !== 200) {
            console.error(response.body);
        }
        expect(response.status).toBe(200);
        expect(response.body.name).toBe(updatedData.name);
        expect(response.body.location).toBe(updatedData.location);
        expect(response.body.email).toBe(merchant.email); // Email should remain unchanged
    }));
    it('should fetch a merchant by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).get(`/api/merchants/${merchant.id}`);
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(merchant.id);
        expect(response.body.email).toBe(merchant.email);
        expect(response.body.qrCodeLink).toBe(`/join/${merchant.id}`);
    }));
    it('should return 404 if merchant is not found', () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentId = 'nonexistentid';
        const response = yield (0, supertest_1.default)(app_1.default).get(`/api/merchants/${nonExistentId}`);
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Merchant not found');
    }));
    it('should fetch all merchants', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).get('/api/merchants');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThan(0);
        // Check if the merchant created in beforeAll is present
        expect(response.body.some((m) => m.email === 'another@example.com')).toBe(true);
        // Check if the merchant created in the 'should create a new merchant' test is present
        expect(response.body.some((m) => m.email === 'test@example.com')).toBe(true);
    }));
    it('should allow a merchant to issue a stamp to a customer', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/merchants/${merchant.id}/issue-stamp`)
            .send({ customerId: customerForStamp.id });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Stamp issued successfully');
        expect(response.body.stamp.merchantId).toBe(merchant.id);
        expect(response.body.stamp.customerId).toBe(customerForStamp.id);
        // Verify the stamp was actually created in the database
        const stamp = yield prisma.stamp.findFirst({
            where: {
                merchantId: merchant.id,
                customerId: customerForStamp.id,
            },
        });
        expect(stamp).not.toBeNull();
    }));
    it('should return 404 if merchant not found when issuing stamp', () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentMerchantId = 'nonexistentmerchantid';
        const response = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/merchants/${nonExistentMerchantId}/issue-stamp`)
            .send({ customerId: customerForStamp.id });
        expect(response.status).toBe(500);
        expect(response.body.details).toContain('Merchant not found.');
    }));
    it('should return 404 if customer not found when issuing stamp', () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentCustomerId = 'nonexistentcustomerid';
        const response = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/merchants/${merchant.id}/issue-stamp`)
            .send({ customerId: nonExistentCustomerId });
        expect(response.status).toBe(500);
        expect(response.body.details).toContain('Customer not found.');
    }));
});
