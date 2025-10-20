import { Router } from 'express';
import { registerCustomer, loginCustomer, joinLoyaltyProgram, getCustomerStamps, redeemReward, updateCustomerProfile, getCustomersByMerchantId } from '../controllers/customerController';

const router = Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/join-program', joinLoyaltyProgram);
router.get('/:customerId/stamps', getCustomerStamps);
router.post('/:customerId/redeem-reward', redeemReward);
router.put('/:id', updateCustomerProfile);
router.get('/merchant/:merchantId/customers', getCustomersByMerchantId);

export default router;