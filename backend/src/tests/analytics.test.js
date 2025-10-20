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
describe('Analytics API', () => {
    let merchant;
    let customer;
    let loyaltyProgram;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Create a merchant
        merchant = yield prisma.merchant.create({
            data: {
                name: 'Analytics Merchant',
                email: 'analytics@example.com',
                password: 'password123',
                businessName: 'Analytics Business',
                businessType: 'Cafe',
            },
        });
        // Create a customer
        customer = yield prisma.customer.create({
            data: {
                email: 'customer@example.com',
                password: 'customerpass',
            },
        });
        // Create a loyalty program for the merchant
        loyaltyProgram = yield prisma.loyaltyProgram.create({
            data: {
                rewardName: 'Free Coffee',
                threshold: 5,
                merchant: { connect: { id: merchant.id } },
            },
        });
        // Issue some stamps to the customer from this merchant
        yield prisma.stamp.create({
            data: {
                customer: { connect: { id: customer.id } },
                merchant: { connect: { id: merchant.id } },
            },
        });
        yield prisma.stamp.create({
            data: {
                customer: { connect: { id: customer.id } },
                merchant: { connect: { id: merchant.id } },
            },
        });
        // Create a reward for the merchant (for counting redeemed rewards)
        yield prisma.reward.create({
            data: {
                name: 'Free Drink',
                points: 5,
                merchant: { connect: { id: merchant.id } },
            },
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clean up created data
        yield prisma.stamp.deleteMany({ where: { merchantId: merchant.id } });
        yield prisma.reward.deleteMany({ where: { merchantId: merchant.id } });
        yield prisma.loyaltyProgram.deleteMany({ where: { merchantId: merchant.id } });
        yield prisma.customer.deleteMany({ where: { id: customer.id } });
        yield prisma.merchant.deleteMany({ where: { id: merchant.id } });
        yield prisma.$disconnect();
    }));
    it('should fetch analytics for a merchant', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).get(`/api/analytics/merchant/${merchant.id}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('customersJoined');
        expect(response.body).toHaveProperty('stampsIssued');
        expect(response.body).toHaveProperty('rewardsRedeemed');
        // Based on the setup in beforeAll
        expect(response.body.customersJoined).toBe(1);
        expect(response.body.stampsIssued).toBe(2);
        expect(response.body.rewardsRedeemed).toBe(1);
    }));
});
