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
exports.updateMerchantBranding = exports.loginMerchant = exports.getNearbyMerchants = exports.updateMerchantSubscription = exports.getCustomersByMerchantId = exports.issueStamp = exports.getAllMerchants = exports.getMerchantById = exports.updateMerchant = exports.createMerchant = void 0;
const merchantService = __importStar(require("../services/merchantService"));
const emailService_1 = require("../services/emailService");
const createMerchant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received create merchant request:', req.body);
        const merchant = yield merchantService.createMerchant(req.body);
        console.log('Merchant created:', merchant);
        yield (0, emailService_1.sendOnboardingEmail)({ email: merchant.email, businessName: merchant.businessName });
        console.log('Onboarding email sent.');
        res.status(201).json(merchant);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error creating merchant:', error.message);
            res.status(500).json({ error: 'Failed to create merchant', details: error.message });
        }
        else {
            console.error('Unknown error creating merchant:', error);
            res.status(500).json({ error: 'Failed to create merchant', details: 'An unknown error occurred' });
        }
    }
});
exports.createMerchant = createMerchant;
const updateMerchant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const merchant = yield merchantService.updateMerchant(id, req.body);
        res.status(200).json(merchant);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to update merchant', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to update merchant', details: 'An unknown error occurred' });
        }
    }
});
exports.updateMerchant = updateMerchant;
const getMerchantById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const merchant = yield merchantService.getMerchantById(id);
        if (merchant) {
            res.status(200).json(merchant);
        }
        else {
            res.status(404).json({ error: 'Merchant not found' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to fetch merchant', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to fetch merchant', details: 'An unknown error occurred' });
        }
    }
});
exports.getMerchantById = getMerchantById;
const getAllMerchants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const merchants = yield merchantService.getAllMerchants();
        res.status(200).json(merchants);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to fetch merchants', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to fetch merchants', details: 'An unknown error occurred' });
        }
    }
});
exports.getAllMerchants = getAllMerchants;
const issueStamp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { merchantId } = req.params;
        const { customerId } = req.body;
        const stamp = yield merchantService.issueStamp(merchantId, customerId);
        res.status(200).json({ message: 'Stamp issued successfully', stamp });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to issue stamp', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to issue stamp', details: 'An unknown error occurred' });
        }
    }
});
exports.issueStamp = issueStamp;
const getCustomersByMerchantId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { merchantId } = req.params;
        const customers = yield merchantService.getCustomersByMerchantId(merchantId);
        res.status(200).json(customers);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to fetch customers', details: 'An unknown error occurred' });
        }
    }
});
exports.getCustomersByMerchantId = getCustomersByMerchantId;
const updateMerchantSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { subscriptionPlan } = req.body;
        const updatedMerchant = yield merchantService.updateMerchantSubscription(id, subscriptionPlan);
        res.status(200).json(updatedMerchant);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to update subscription plan', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to update subscription plan', details: 'An unknown error occurred' });
        }
    }
});
exports.updateMerchantSubscription = updateMerchantSubscription;
const getNearbyMerchants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { location } = req.query;
        if (!location || typeof location !== 'string') {
            return res.status(400).json({ error: 'Location query parameter is required.' });
        }
        const merchants = yield merchantService.getNearbyMerchants(location);
        res.status(200).json(merchants);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to fetch nearby merchants', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to fetch nearby merchants', details: 'An unknown error occurred' });
        }
    }
});
exports.getNearbyMerchants = getNearbyMerchants;
const loginMerchant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const merchant = yield merchantService.loginMerchant(email, password);
        res.status(200).json({ message: 'Merchant logged in successfully', merchant: { id: merchant.id, email: merchant.email } });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred during login' });
        }
    }
});
exports.loginMerchant = loginMerchant;
const updateMerchantBranding = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { theme } = req.body;
        let logoPath;
        if (req.file) {
            logoPath = `/uploads/${req.file.filename}`; // Store path relative to server
        }
        const updatedData = {};
        if (logoPath) {
            updatedData.logo = logoPath;
        }
        if (theme) {
            updatedData.theme = theme;
        }
        const updatedMerchant = yield merchantService.updateMerchant(id, updatedData);
        res.status(200).json(updatedMerchant);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to update merchant branding', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to update merchant branding', details: 'An unknown error occurred' });
        }
    }
});
exports.updateMerchantBranding = updateMerchantBranding;
