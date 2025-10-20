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
exports.joinLoyaltyProgram = exports.deleteLoyaltyProgram = exports.updateLoyaltyProgram = exports.getLoyaltyProgramById = exports.getLoyaltyProgramsByMerchantId = exports.createLoyaltyProgram = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createLoyaltyProgram = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.loyaltyProgram.create({
        data,
    });
});
exports.createLoyaltyProgram = createLoyaltyProgram;
const getLoyaltyProgramsByMerchantId = (merchantId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.loyaltyProgram.findMany({
        where: { merchantId },
    });
});
exports.getLoyaltyProgramsByMerchantId = getLoyaltyProgramsByMerchantId;
const getLoyaltyProgramById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.loyaltyProgram.findUnique({
        where: { id },
    });
});
exports.getLoyaltyProgramById = getLoyaltyProgramById;
const updateLoyaltyProgram = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.loyaltyProgram.update({
        where: { id },
        data,
    });
});
exports.updateLoyaltyProgram = updateLoyaltyProgram;
const deleteLoyaltyProgram = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the loyalty program to get its merchantId
    const loyaltyProgram = yield prisma.loyaltyProgram.findUnique({
        where: { id },
        select: { merchantId: true },
    });
    if (!loyaltyProgram) {
        throw new Error('Loyalty program not found.');
    }
    // Delete all stamps associated with this merchant (simplification given current schema)
    // Ideally, stamps would be directly linked to a loyalty program.
    yield prisma.stamp.deleteMany({
        where: { merchantId: loyaltyProgram.merchantId },
    });
    // Then delete the loyalty program
    return prisma.loyaltyProgram.delete({
        where: { id },
    });
});
exports.deleteLoyaltyProgram = deleteLoyaltyProgram;
const joinLoyaltyProgram = (customerId, loyaltyProgramId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if loyalty program exists
    const loyaltyProgram = yield prisma.loyaltyProgram.findUnique({
        where: { id: loyaltyProgramId },
    });
    if (!loyaltyProgram) {
        throw new Error('Loyalty program not found.');
    }
    // Check if customer exists
    const customer = yield prisma.customer.findUnique({
        where: { id: customerId },
    });
    if (!customer) {
        throw new Error('Customer not found.');
    }
    // Check if customer has already joined this loyalty program
    const existingEntry = yield prisma.customerLoyaltyProgram.findUnique({
        where: {
            customerId_loyaltyProgramId: {
                customerId,
                loyaltyProgramId,
            },
        },
    });
    if (existingEntry) {
        throw new Error('Customer already joined this loyalty program.');
    }
    const newEntry = yield prisma.customerLoyaltyProgram.create({
        data: {
            customerId,
            loyaltyProgramId,
        },
    });
    return newEntry;
});
exports.joinLoyaltyProgram = joinLoyaltyProgram;
