import { Router } from 'express';
import { registerCustomer, loginCustomer, joinLoyaltyProgram, getCustomerStamps } from '../controllers/customerController';

const router = Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/join-program', joinLoyaltyProgram);
router.get('/:customerId/stamps', getCustomerStamps);

export default router;