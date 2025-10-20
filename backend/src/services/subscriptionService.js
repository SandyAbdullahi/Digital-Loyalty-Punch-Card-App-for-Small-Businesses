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
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSubscription = exports.updateSubscription = exports.getSubscriptionByMerchantId = exports.createSubscription = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createSubscription = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // In a real application, this would interact with a payment gateway (e.g., Stripe, PayPal)
    // to create a subscription and get a subscription ID.
    console.log('Simulating subscription creation for merchant:', data.merchantId, 'Plan:', data.plan);
    const subscription = yield prisma.subscription.create({
        data: {
            merchantId: data.merchantId,
            plan: data.plan,
            status: data.status,
            startDate: data.startDate,
            endDate: data.endDate,
        },
    });
    return subscription;
});
exports.createSubscription = createSubscription;
const getSubscriptionByMerchantId = (merchantId) => __awaiter(void 0, void 0, void 0, function* () {
    const subscription = yield prisma.subscription.findFirst({
        where: { merchantId },
    });
    return subscription;
});
exports.getSubscriptionByMerchantId = getSubscriptionByMerchantId;
const updateSubscription = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Simulating subscription update for ID:', id, 'Data:', data);
    const subscription = yield prisma.subscription.update({
        where: { id },
        data,
    });
    return subscription;
});
exports.updateSubscription = updateSubscription;
const cancelSubscription = (id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Simulating subscription cancellation for ID:', id);
    const subscription = yield prisma.subscription.update({
        where: { id },
        data: { status: 'cancelled', endDate: new Date() },
    });
    return subscription;
});
exports.cancelSubscription = cancelSubscription;
