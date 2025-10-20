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
exports.sendOnboardingEmail = void 0;
const sendOnboardingEmail = (merchant) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`
  ========================================
  Simulating Onboarding Email to: ${merchant.email}
  Subject: Welcome to [App Name], ${merchant.businessName}!
  
  Dear ${merchant.businessName},
  
  Welcome to [App Name]! We're thrilled to have you on board.
  
  Get started by setting up your first loyalty program and generating QR codes for your customers.
  
  [Link to Merchant Dashboard]
  
  Best regards,
  The [App Name] Team
  ========================================
  `);
    // In a real application, this would integrate with an email service provider (e.g., SendGrid, Mailgun, AWS SES)
    return { success: true, message: 'Onboarding email simulated successfully.' };
});
exports.sendOnboardingEmail = sendOnboardingEmail;
