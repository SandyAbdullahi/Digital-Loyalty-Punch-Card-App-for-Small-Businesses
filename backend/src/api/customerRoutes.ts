import { Router } from 'express';
import { registerCustomer, loginCustomer, joinLoyaltyProgram, getCustomerStamps, redeemReward, updateCustomerProfile, getCustomersByMerchantId, deleteCustomerStampsForMerchant, getCustomerHistoryForMerchant, getCustomerById } from '../controllers/customerController';

const router = Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/join-program', joinLoyaltyProgram);
router.get('/:customerId/stamps', getCustomerStamps);
router.post('/:customerId/redeem-reward', redeemReward);
router.put('/:id', updateCustomerProfile);
router.get('/details/:id', getCustomerById);
router.get('/merchant/:merchantId/customers', getCustomersByMerchantId);
router.delete('/merchant/:merchantId/customer/:customerId', deleteCustomerStampsForMerchant);
router.get('/merchant/:merchantId/customer/:customerId/history', getCustomerHistoryForMerchant);

export default router;
