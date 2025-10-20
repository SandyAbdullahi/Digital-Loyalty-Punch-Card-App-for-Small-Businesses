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
exports.cancelSubscription = exports.updateSubscription = exports.getSubscriptionByMerchantId = exports.createSubscription = void 0;
const subscriptionService = __importStar(require("../services/subscriptionService"));
const createSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subscription = yield subscriptionService.createSubscription(req.body);
        res.status(201).json(subscription);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to create subscription', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to create subscription', details: 'An unknown error occurred' });
        }
    }
});
exports.createSubscription = createSubscription;
const getSubscriptionByMerchantId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { merchantId } = req.params;
        const subscription = yield subscriptionService.getSubscriptionByMerchantId(merchantId);
        if (subscription) {
            res.status(200).json(subscription);
        }
        else {
            res.status(404).json({ error: 'Subscription not found for this merchant' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to fetch subscription', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to fetch subscription', details: 'An unknown error occurred' });
        }
    }
});
exports.getSubscriptionByMerchantId = getSubscriptionByMerchantId;
const updateSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const subscription = yield subscriptionService.updateSubscription(id, req.body);
        res.status(200).json(subscription);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to update subscription', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to update subscription', details: 'An unknown error occurred' });
        }
    }
});
exports.updateSubscription = updateSubscription;
const cancelSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const subscription = yield subscriptionService.cancelSubscription(id);
        res.status(200).json(subscription);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: 'Failed to cancel subscription', details: error.message });
        }
        else {
            res.status(500).json({ error: 'Failed to cancel subscription', details: 'An unknown error occurred' });
        }
    }
});
exports.cancelSubscription = cancelSubscription;
