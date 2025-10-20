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
exports.getNearbyMerchants = exports.updateMerchantSubscription = exports.getCustomersByMerchantId = exports.issueStamp = exports.getAllMerchants = exports.getMerchantById = exports.updateMerchant = exports.loginMerchant = exports.createMerchant = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const notificationService_1 = require("../services/notificationService");
const prisma = new client_1.PrismaClient();
const createMerchant = (data) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Service: createMerchant called with data:', data);
    const hashedPassword = yield bcryptjs_1.default.hash(data.password, 10);
    console.log('Service: Password hashed.');
    const merchant = yield prisma.merchant.create({
        data: Object.assign(Object.assign({}, data), { password: hashedPassword }),
    });
    console.log('Service: Merchant created in DB:', merchant);
    // Generate QR code link after merchant creation
    const qrCodeLink = `/join/${merchant.id}`;
    console.log('Service: QR Code Link generated:', qrCodeLink);
    return prisma.merchant.update({
        where: { id: merchant.id },
        data: { qrCodeLink },
    });
});
exports.createMerchant = createMerchant;
const loginMerchant = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const merchant = yield prisma.merchant.findUnique({
        where: { email },
    });
    if (!merchant) {
        throw new Error('Invalid credentials');
    }
    const isValidPassword = yield bcryptjs_1.default.compare(password, merchant.password);
    if (!isValidPassword) {
        throw new Error('Invalid credentials');
    }
    return merchant;
});
exports.loginMerchant = loginMerchant;
const updateMerchant = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.merchant.update({
        where: { id },
        data,
    });
});
exports.updateMerchant = updateMerchant;
const getMerchantById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.merchant.findUnique({
        where: { id },
    });
});
exports.getMerchantById = getMerchantById;
const getAllMerchants = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.merchant.findMany();
});
exports.getAllMerchants = getAllMerchants;
const issueStamp = (merchantId, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    // Basic validation: check if merchant and customer exist
    const merchantExists = yield prisma.merchant.findUnique({ where: { id: merchantId } });
    const customerExists = yield prisma.customer.findUnique({ where: { id: customerId } });
    if (!merchantExists) {
        throw new Error('Merchant not found.');
    }
    if (!customerExists) {
        throw new Error('Customer not found.');
    }
    const stamp = yield prisma.stamp.create({
        data: {
            merchantId,
            customerId,
        },
    });
    // Send notification to customer
    yield (0, notificationService_1.sendPushNotification)({ customerId, title: 'Stamp Earned!', body: 'You just earned a stamp!' });
    return stamp;
});
exports.issueStamp = issueStamp;
const getCustomersByMerchantId = (merchantId) => __awaiter(void 0, void 0, void 0, function* () {
    const customerStamps = yield prisma.stamp.findMany({
        where: { merchantId },
        select: { customer: true },
        distinct: ['customerId'],
    });
    return customerStamps.map(cs => cs.customer);
});
exports.getCustomersByMerchantId = getCustomersByMerchantId;
const updateMerchantSubscription = (id, subscriptionPlan) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.merchant.update({
        where: { id },
        data: { subscriptionPlan },
    });
});
exports.updateMerchantSubscription = updateMerchantSubscription;
const getNearbyMerchants = (location) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.merchant.findMany({
        where: {
            location: {
                contains: location, // Case-insensitive search for location
            },
        },
    });
});
exports.getNearbyMerchants = getNearbyMerchants;
