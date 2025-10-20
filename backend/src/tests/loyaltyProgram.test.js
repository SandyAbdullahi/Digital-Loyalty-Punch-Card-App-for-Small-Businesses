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
describe('LoyaltyProgram API', () => {
    let merchant;
    let loyaltyProgram;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Create a merchant first to associate loyalty programs with
        merchant = yield prisma.merchant.create({
            data: {
                name: 'Test Merchant for LP',
                email: 'lp_test@example.com',
                password: 'password123',
                businessName: 'LP Test Business',
                businessType: 'Restaurant',
            },
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (loyaltyProgram) {
            yield prisma.loyaltyProgram.delete({ where: { id: loyaltyProgram.id } });
        }
        if (merchant) {
            yield prisma.merchant.delete({ where: { id: merchant.id } });
        }
        yield prisma.$disconnect();
    }));
    it('should create a new loyalty program', () => __awaiter(void 0, void 0, void 0, function* () {
        const newLoyaltyProgram = {
            merchantId: merchant.id,
            rewardName: 'Free Coffee',
            threshold: 10,
            expiryDate: new Date().toISOString(),
        };
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/loyalty-programs')
            .send(newLoyaltyProgram);
        expect(response.status).toBe(201);
        expect(response.body.rewardName).toBe(newLoyaltyProgram.rewardName);
        expect(response.body.threshold).toBe(newLoyaltyProgram.threshold);
        expect(response.body.joinUrl).toMatch(new RegExp(`\\/join\\/${response.body.id}$`));
        loyaltyProgram = response.body;
    }));
    it('should reject loyalty program creation with invalid threshold', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/loyalty-programs')
            .send({
            merchantId: merchant.id,
            rewardName: 'Invalid Threshold',
            threshold: 0,
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('threshold must be a positive number.');
    }));
    it('should reject loyalty program creation with invalid expiry date', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .post('/api/loyalty-programs')
            .send({
            merchantId: merchant.id,
            rewardName: 'Invalid Expiry',
            threshold: 5,
            expiryDate: 'not-a-date',
        });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('expiryDate is invalid.');
    }));
    it('should fetch loyalty programs by merchant ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).get(`/api/loyalty-programs/merchant/${merchant.id}`);
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].merchantId).toBe(merchant.id);
    }));
    it('should fetch a loyalty program by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).get(`/api/loyalty-programs/${loyaltyProgram.id}`);
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(loyaltyProgram.id);
        expect(response.body.rewardName).toBe(loyaltyProgram.rewardName);
    }));
    it('should update an existing loyalty program', () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedData = {
            rewardName: 'Free Large Coffee',
            threshold: 12,
        };
        const response = yield (0, supertest_1.default)(app_1.default)
            .put(`/api/loyalty-programs/${loyaltyProgram.id}`)
            .send(updatedData);
        expect(response.status).toBe(200);
        expect(response.body.rewardName).toBe(updatedData.rewardName);
        expect(response.body.threshold).toBe(updatedData.threshold);
    }));
    it('should delete a loyalty program', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).delete(`/api/loyalty-programs/${loyaltyProgram.id}`);
        expect(response.status).toBe(204);
        const fetchResponse = yield (0, supertest_1.default)(app_1.default).get(`/api/loyalty-programs/${loyaltyProgram.id}`);
        expect(fetchResponse.status).toBe(404);
        loyaltyProgram = null; // Clear loyaltyProgram after deletion
    }));
});
