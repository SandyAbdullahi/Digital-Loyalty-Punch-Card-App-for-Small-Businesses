"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const merchantRoutes_1 = __importDefault(require("./api/merchantRoutes"));
const loyaltyProgramRoutes_1 = __importDefault(require("./api/loyaltyProgramRoutes"));
const analyticsRoutes_1 = __importDefault(require("./api/analyticsRoutes"));
const customerRoutes_1 = __importDefault(require("./api/customerRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./api/subscriptionRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});
app.use('/api/merchants', merchantRoutes_1.default);
app.use('/api/loyalty-programs', loyaltyProgramRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/customers', customerRoutes_1.default);
app.use('/api/subscriptions', subscriptionRoutes_1.default);
exports.default = app;
