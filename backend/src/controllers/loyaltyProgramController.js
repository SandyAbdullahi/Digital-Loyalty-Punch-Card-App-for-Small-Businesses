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
exports.joinLoyaltyProgram = exports.getLoyaltyProgramQrCode = exports.deleteLoyaltyProgram = exports.updateLoyaltyProgram = exports.getLoyaltyProgramById = exports.getLoyaltyProgramsByMerchantId = exports.createLoyaltyProgram = void 0;
const loyaltyProgramService = __importStar(require("../services/loyaltyProgramService"));
const qrCodeService_1 = require("../services/qrCodeService");
const createLoyaltyProgram = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { merchantId, rewardName, threshold, expiryDate } = req.body;
        if (!merchantId || !rewardName || threshold === undefined || threshold === null) {
            return res.status(400).json({ error: 'merchantId, rewardName and threshold are required.' });
        }
        const numericThreshold = Number(threshold);
        if (Number.isNaN(numericThreshold) || numericThreshold <= 0) {
            return res.status(400).json({ error: 'threshold must be a positive number.' });
        }
        let parsedExpiryDate;
        if (expiryDate !== undefined && expiryDate !== null && expiryDate !== '') {
            const candidate = new Date(expiryDate);
            if (Number.isNaN(candidate.getTime())) {
                return res.status(400).json({ error: 'expiryDate is invalid.' });
            }
            parsedExpiryDate = candidate;
        }
        const createData = Object.assign({ rewardName, threshold: numericThreshold, merchant: { connect: { id: merchantId } } }, (parsedExpiryDate ? { expiryDate: parsedExpiryDate } : {}));
        const loyaltyProgram = yield loyaltyProgramService.createLoyaltyProgram(createData);
        const joinUrl = `${process.env.FRONTEND_URL}/join/${loyaltyProgram.id}`;
        const qrCodeDataUrl = yield (0, qrCodeService_1.generateQrCode)(joinUrl);
        const updatedProgram = yield loyaltyProgramService.updateLoyaltyProgram(loyaltyProgram.id, {
            qrCodeDataUrl,
        });
        res.status(201).json(Object.assign(Object.assign({}, updatedProgram), { joinUrl }));
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to create loyalty program', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to create loyalty program', details: 'An unknown error occurred' });
        }
    }
});
exports.createLoyaltyProgram = createLoyaltyProgram;
const getLoyaltyProgramsByMerchantId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { merchantId } = req.params;
        const loyaltyPrograms = yield loyaltyProgramService.getLoyaltyProgramsByMerchantId(merchantId);
        res.status(200).json(loyaltyPrograms);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to fetch loyalty programs', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to fetch loyalty programs', details: 'An unknown error occurred' });
        }
    }
});
exports.getLoyaltyProgramsByMerchantId = getLoyaltyProgramsByMerchantId;
const getLoyaltyProgramById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const loyaltyProgram = yield loyaltyProgramService.getLoyaltyProgramById(id);
        if (loyaltyProgram) {
            res.status(200).json(loyaltyProgram);
        }
        else {
            res.status(404).json({ error: 'Loyalty program not found' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to fetch loyalty program', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to fetch loyalty program', details: 'An unknown error occurred' });
        }
    }
});
exports.getLoyaltyProgramById = getLoyaltyProgramById;
const updateLoyaltyProgram = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { rewardName, threshold, expiryDate } = req.body;
        const updateData = {};
        if (rewardName !== undefined) {
            updateData.rewardName = rewardName;
        }
        if (threshold !== undefined) {
            const numericThreshold = Number(threshold);
            if (Number.isNaN(numericThreshold) || numericThreshold <= 0) {
                return res.status(400).json({ error: 'threshold must be a positive number.' });
            }
            updateData.threshold = numericThreshold;
        }
        if (expiryDate !== undefined) {
            if (expiryDate === null || expiryDate === '') {
                updateData.expiryDate = null;
            }
            else {
                const candidate = new Date(expiryDate);
                if (Number.isNaN(candidate.getTime())) {
                    return res.status(400).json({ error: 'expiryDate is invalid.' });
                }
                updateData.expiryDate = candidate;
            }
        }
        const loyaltyProgram = yield loyaltyProgramService.updateLoyaltyProgram(id, updateData);
        res.status(200).json(loyaltyProgram);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to update loyalty program', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to update loyalty program', details: 'An unknown error occurred' });
        }
    }
});
exports.updateLoyaltyProgram = updateLoyaltyProgram;
const deleteLoyaltyProgram = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield loyaltyProgramService.deleteLoyaltyProgram(id);
        res.status(204).send(); // No content
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to delete loyalty program', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to delete loyalty program', details: 'An unknown error occurred' });
        }
    }
});
exports.deleteLoyaltyProgram = deleteLoyaltyProgram;
const getLoyaltyProgramQrCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const loyaltyProgram = yield loyaltyProgramService.getLoyaltyProgramById(id);
        if (!loyaltyProgram) {
            return res.status(404).json({ error: 'Loyalty program not found' });
        }
        const joinUrl = `${process.env.FRONTEND_URL}/join/${loyaltyProgram.id}`;
        let qrCodeDataUrl = loyaltyProgram.qrCodeDataUrl;
        if (!qrCodeDataUrl) {
            qrCodeDataUrl = yield (0, qrCodeService_1.generateQrCode)(joinUrl);
            yield loyaltyProgramService.updateLoyaltyProgram(id, { qrCodeDataUrl });
        }
        res.status(200).json({ qrCodeImage: qrCodeDataUrl, joinUrl });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to retrieve QR code', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to retrieve QR code', details: 'An unknown error occurred' });
        }
    }
});
exports.getLoyaltyProgramQrCode = getLoyaltyProgramQrCode;
const joinLoyaltyProgram = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId, loyaltyProgramId } = req.body;
        const customerLoyaltyProgram = yield loyaltyProgramService.joinLoyaltyProgram(customerId, loyaltyProgramId);
        res.status(200).json(customerLoyaltyProgram);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error joining loyalty program:', error.message);
            res.status(500).json({ error: 'Failed to join loyalty program', details: error.message });
        }
        else {
            console.error('Unknown error joining loyalty program:', error);
            res.status(500).json({ error: 'Failed to join loyalty program', details: 'An unknown error occurred' });
        }
    }
});
exports.joinLoyaltyProgram = joinLoyaltyProgram;
