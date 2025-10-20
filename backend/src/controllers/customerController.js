"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getCustomerHistoryForMerchant = exports.deleteCustomerStampsForMerchant = exports.getCustomersByMerchantId = exports.updateCustomerProfile = exports.redeemReward = exports.getCustomerStamps = exports.joinLoyaltyProgram = exports.loginCustomer = exports.registerCustomer = void 0;
const customerService = __importStar(require("../services/customerService"));
const registerCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customer = yield customerService.createCustomer(req.body);
        // In a real app, you'd generate a JWT here and send it back
        res.status(201).json({ message: 'Customer registered successfully', customer: { id: customer.id, email: customer.email } });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to register customer', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to register customer', details: 'An unknown error occurred' });
        }
    }
});
exports.registerCustomer = registerCustomer;
const loginCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const customer = yield customerService.findCustomerByEmail(email);
        if (!customer) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const isValidPassword = yield customerService.validatePassword(password, customer.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        // In a real app, you'd generate a JWT here and send it back
        res.status(200).json({ message: 'Customer logged in successfully', customer: { id: customer.id, email: customer.email } });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to log in customer', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to log in customer', details: 'An unknown error occurred' });
        }
    }
});
exports.loginCustomer = loginCustomer;
const joinLoyaltyProgram = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, programIdentifier } = req.body;
        console.log('[CustomerController.joinLoyaltyProgram] Incoming request', {
            customerId,
            programIdentifier,
        });
        if (!programIdentifier) {
            console.log('[CustomerController.joinLoyaltyProgram] Missing programIdentifier');
            return res.status(400).json({ error: 'Program identifier is required.' });
        }
        const { merchantId, loyaltyProgramId } = yield customerService.resolveProgramIdentifier(programIdentifier);
        console.log('[CustomerController.joinLoyaltyProgram] Resolved identifier', {
            merchantId,
            loyaltyProgramId,
        });
        const stamp = yield customerService.joinMerchantLoyaltyProgram(customerId, merchantId, loyaltyProgramId);
        console.log('[CustomerController.joinLoyaltyProgram] Join succeeded', {
            stampId: stamp.id,
            merchantId: stamp.merchantId,
            loyaltyProgramId,
        });
        res.status(200).json({ message: 'Successfully joined loyalty program', stamp, loyaltyProgramId });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log('[CustomerController.joinLoyaltyProgram] Join failed', {
                error: error.message,
                stack: error.stack,
            });
            if (error.message.includes('Invalid program identifier')) {
                res.status(400).json({ error: error.message });
            }
            else if (error.message.includes('already joined this merchant')) {
                res.status(409).json({ error: error.message });
            }
            else if (error.message.includes('already joined this loyalty program')) {
                res.status(409).json({ error: error.message });
            }
            else if (error.message.includes('Customer not found')) {
                res.status(404).json({ error: error.message });
            }
            else if (error.message.includes('Merchant not found')) {
                res.status(404).json({ error: error.message });
            }
            else if (error.message.includes('Loyalty program not found')) {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to join loyalty program', details: error.message });
            }
        }
        else {
            res.status(500).json({ error: 'Failed to join loyalty program', details: 'An unknown error occurred' });
        }
    }
});
exports.joinLoyaltyProgram = joinLoyaltyProgram;
const getCustomerStamps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId } = req.params;
        const stamps = yield customerService.getCustomerStamps(customerId);
        res.status(200).json(stamps);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to fetch customer stamps', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to fetch customer stamps', details: 'An unknown error occurred' });
        }
    }
});
exports.getCustomerStamps = getCustomerStamps;
const redeemReward = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId } = req.params;
        const { loyaltyProgramId } = req.body;
        const result = yield customerService.redeemReward(customerId, loyaltyProgramId);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to redeem reward', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to redeem reward', details: 'An unknown error occurred' });
        }
    }
});
exports.redeemReward = redeemReward;
const updateCustomerProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updatedCustomer = yield customerService.updateCustomerProfile(id, req.body);
        res.status(200).json(updatedCustomer);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to update customer profile', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to update customer profile', details: 'An unknown error occurred' });
        }
    }
});
exports.updateCustomerProfile = updateCustomerProfile;
const getCustomersByMerchantId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { merchantId } = req.params;
        const customers = yield customerService.getCustomersByMerchantId(merchantId);
        res.status(200).json(customers);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to fetch customers for merchant', details: error.message });
        }
        else {
        }
    }
});
exports.getCustomersByMerchantId = getCustomersByMerchantId;
const deleteCustomerStampsForMerchant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { merchantId, customerId } = req.params;
        yield customerService.deleteCustomerStampsForMerchant(merchantId, customerId);
        res.status(200).json({ message: 'Customer successfully disassociated from loyalty program.' });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to disassociate customer', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to disassociate customer', details: 'An unknown error occurred' });
        }
    }
});
exports.deleteCustomerStampsForMerchant = deleteCustomerStampsForMerchant;
const getCustomerHistoryForMerchant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { merchantId, customerId } = req.params;
        const history = yield customerService.getCustomerHistoryForMerchant(merchantId, customerId);
        res.status(200).json(history);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to fetch customer history', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to fetch customer history', details: 'An unknown error occurred' });
        }
    }
});
exports.getCustomerHistoryForMerchant = getCustomerHistoryForMerchant;
