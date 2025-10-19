
import { Router } from 'express';
import { createMerchant } from '../controllers/merchantController';

const router = Router();

router.post('/', createMerchant);

export default router;
