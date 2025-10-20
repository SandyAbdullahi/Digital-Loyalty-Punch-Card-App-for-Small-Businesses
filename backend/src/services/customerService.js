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
exports.getCustomerHistoryForMerchant = exports.deleteCustomerStampsForMerchant = exports.resolveProgramIdentifier = exports.getCustomersByMerchantId = exports.updateCustomerProfile = exports.redeemReward = exports.getCustomerStamps = exports.joinMerchantLoyaltyProgram = exports.validatePassword = exports.findCustomerByEmail = exports.createCustomer = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const notificationService_1 = require("../services/notificationService");
const prisma = new client_1.PrismaClient();
const createCustomer = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcryptjs_1.default.hash(data.password, 10);
    try {
        return prisma.customer.create({
            data: Object.assign(Object.assign({}, data), { password: hashedPassword }),
        });
    }
    catch (error) {
        console.error('Error creating customer:', error);
        throw error; // Re-throw the error after logging
    }
});
exports.createCustomer = createCustomer;
const findCustomerByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.customer.findUnique({
        where: { email },
    });
});
exports.findCustomerByEmail = findCustomerByEmail;
const validatePassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return bcryptjs_1.default.compare(password, hashedPassword);
});
exports.validatePassword = validatePassword;
const joinMerchantLoyaltyProgram = (customerId, merchantId, loyaltyProgramId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[customerService.joinMerchantLoyaltyProgram] Start', {
        customerId,
        merchantId,
        loyaltyProgramId,
    });
    // Validate customer and merchant existence
    const customer = yield prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
        console.log('[customerService.joinMerchantLoyaltyProgram] Customer not found', { customerId });
        throw new Error('Customer not found.');
    }
    const merchant = yield prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) {
        console.log('[customerService.joinMerchantLoyaltyProgram] Merchant not found', { merchantId });
        throw new Error('Merchant not found.');
    }
    const existingStamp = yield prisma.stamp.findFirst({
        where: {
            customerId,
            merchantId,
        },
    });
    if (loyaltyProgramId) {
        const loyaltyProgram = yield prisma.loyaltyProgram.findUnique({
            where: { id: loyaltyProgramId },
            select: { id: true, merchantId: true },
        });
        if (!loyaltyProgram || loyaltyProgram.merchantId !== merchantId) {
            console.log('[customerService.joinMerchantLoyaltyProgram] Loyalty program mismatch', {
                loyaltyProgramId,
                merchantId,
                loyaltyProgramMerchantId: loyaltyProgram === null || loyaltyProgram === void 0 ? void 0 : loyaltyProgram.merchantId,
            });
            throw new Error('Loyalty program not found for this merchant.');
        }
        const existingMembership = yield prisma.customerLoyaltyProgram.findUnique({
            where: {
                customerId_loyaltyProgramId: {
                    customerId,
                    loyaltyProgramId,
                },
            },
        });
        if (existingMembership) {
            console.log('[customerService.joinMerchantLoyaltyProgram] Already joined loyalty program', {
                customerId,
                loyaltyProgramId,
            });
            throw new Error('Customer already joined this loyalty program.');
        }
        yield prisma.customerLoyaltyProgram.create({
            data: {
                customerId,
                loyaltyProgramId,
            },
        });
        if (existingStamp) {
            console.log('[customerService.joinMerchantLoyaltyProgram] Using existing stamp record', {
                stampId: existingStamp.id,
            });
            return existingStamp;
        }
    }
    else if (existingStamp) {
        console.log('[customerService.joinMerchantLoyaltyProgram] Already joined merchant program via stamp', {
            stampId: existingStamp.id,
        });
        throw new Error(`Customer has already joined this merchant's loyalty program.`);
    }
    // Create an initial stamp entry to signify joining
    try {
        const stamp = yield prisma.stamp.create({
            data: {
                customer: { connect: { id: customerId } },
                merchant: { connect: { id: merchantId } },
            },
        });
        console.log('[customerService.joinMerchantLoyaltyProgram] Created new stamp entry', {
            stampId: stamp.id,
        });
        return stamp;
    }
    catch (error) {
        console.error('Error creating stamp:', error);
        throw new Error('Failed to create stamp entry for loyalty program.');
    }
});
exports.joinMerchantLoyaltyProgram = joinMerchantLoyaltyProgram;
const getCustomerStamps = (customerId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.stamp.findMany({
        where: { customerId },
    });
});
exports.getCustomerStamps = getCustomerStamps;
const redeemReward = (customerId, loyaltyProgramId) => __awaiter(void 0, void 0, void 0, function* () {
    const loyaltyProgram = yield prisma.loyaltyProgram.findUnique({
        where: { id: loyaltyProgramId },
    });
    if (!loyaltyProgram) {
        throw new Error('Loyalty program not found.');
    }
    const customerStamps = yield prisma.stamp.findMany({
        where: {
            customerId,
            merchantId: loyaltyProgram.merchantId,
        },
    });
    if (customerStamps.length < loyaltyProgram.threshold) {
        throw new Error('Not enough stamps to redeem this reward.');
    }
    // Delete stamps used for redemption
    const stampsToDelete = customerStamps.slice(0, loyaltyProgram.threshold);
    yield prisma.stamp.deleteMany({
        where: {
            id: {
                in: stampsToDelete.map(stamp => stamp.id),
            },
        },
    });
    // Send notification to customer
    yield (0, notificationService_1.sendPushNotification)({ customerId, title: 'Reward Redeemed!', body: `Reward '${loyaltyProgram.rewardName}' redeemed successfully!` });
    // In a real application, you might want to record the redemption in a separate table
    // For now, we'll just return a success message.
    return { message: `Reward '${loyaltyProgram.rewardName}' redeemed successfully!` };
});
exports.redeemReward = redeemReward;
const updateCustomerProfile = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data.password) {
        data.password = yield bcryptjs_1.default.hash(data.password, 10);
    }
    return prisma.customer.update({
        where: { id },
        data,
    });
});
exports.updateCustomerProfile = updateCustomerProfile;
const getCustomersByMerchantId = (merchantId) => __awaiter(void 0, void 0, void 0, function* () {
    // Find all unique customer IDs that have stamps with this merchant
    const customerStamps = yield prisma.stamp.findMany({
        where: { merchantId },
        distinct: ['customerId'],
        select: { customerId: true },
    });
    const customerIds = customerStamps.map(stamp => stamp.customerId);
    // Fetch the customer details for these IDs
    return prisma.customer.findMany({
        where: {
            id: {
                in: customerIds,
            },
        },
        select: { id: true, email: true, createdAt: true }, // Select relevant customer fields
    });
});
exports.getCustomersByMerchantId = getCustomersByMerchantId;
const resolveProgramIdentifier = (programIdentifier) => __awaiter(void 0, void 0, void 0, function* () {
    if (!programIdentifier || !programIdentifier.trim()) {
        console.log('[customerService.resolveProgramIdentifier] Empty identifier');
        throw new Error('Invalid program identifier: No value provided.');
    }
    console.log('[customerService.resolveProgramIdentifier] Resolving identifier', { programIdentifier });
    const tryResolveCandidate = (candidate) => __awaiter(void 0, void 0, void 0, function* () {
        const trimmed = candidate.trim().replace(/^\/+|\/+$/g, '');
        if (!trimmed || trimmed.toLowerCase() === 'join') {
            return null;
        }
        const loyaltyProgram = yield prisma.loyaltyProgram.findUnique({
            where: { id: trimmed },
            select: { merchantId: true, id: true },
        });
        if (loyaltyProgram) {
            return {
                merchantId: loyaltyProgram.merchantId,
                loyaltyProgramId: trimmed,
            };
        }
        const merchant = yield prisma.merchant.findUnique({
            where: { id: trimmed },
            select: { id: true },
        });
        if (merchant) {
            return { merchantId: merchant.id };
        }
        return null;
    });
    const attemptQueue = [];
    const pushCandidate = (value) => {
        if (value === null || value === undefined) {
            return;
        }
        let decoded = value;
        try {
            decoded = decodeURIComponent(value);
        }
        catch (_a) {
            decoded = value;
        }
        if (!decoded.trim()) {
            return;
        }
        attemptQueue.push(decoded);
    };
    pushCandidate(programIdentifier);
    try {
        const parsedUrl = new URL(programIdentifier);
        pushCandidate(parsedUrl.pathname);
        pushCandidate(parsedUrl.pathname.split('/').filter(Boolean).join('/'));
        parsedUrl.pathname
            .split('/')
            .filter(Boolean)
            .forEach((segment) => pushCandidate(segment));
    }
    catch (_a) {
        // Not a valid URL, treat as a raw identifier or path
        programIdentifier
            .split('/')
            .filter(Boolean)
            .forEach((segment) => pushCandidate(segment));
    }
    const visited = new Set();
    for (const candidate of attemptQueue) {
        if (visited.has(candidate)) {
            continue;
        }
        visited.add(candidate);
        console.log('[customerService.resolveProgramIdentifier] Trying candidate', { candidate });
        const resolved = yield tryResolveCandidate(candidate);
        if (resolved) {
            console.log('[customerService.resolveProgramIdentifier] Resolved candidate', resolved);
            return resolved;
        }
    }
    console.log('[customerService.resolveProgramIdentifier] Failed to resolve identifier');
    throw new Error('Invalid program identifier: No matching loyalty program or merchant found.');
});
exports.resolveProgramIdentifier = resolveProgramIdentifier;
const deleteCustomerStampsForMerchant = (merchantId, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.stamp.deleteMany({
        where: {
            merchantId: merchantId,
            customerId: customerId,
        },
    });
});
exports.deleteCustomerStampsForMerchant = deleteCustomerStampsForMerchant;
const getCustomerHistoryForMerchant = (merchantId, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const stamps = yield prisma.stamp.findMany({
        where: {
            merchantId: merchantId,
            customerId: customerId,
        },
        orderBy: { createdAt: 'asc' },
    });
    // In a more complete system, you would also fetch reward redemptions here
    // For now, we only return stamps.
    return { stamps };
});
exports.getCustomerHistoryForMerchant = getCustomerHistoryForMerchant;
