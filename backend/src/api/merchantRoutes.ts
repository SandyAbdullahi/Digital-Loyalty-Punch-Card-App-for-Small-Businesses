
import { Router } from 'express';
import { createMerchant, updateMerchant, getMerchantById, getAllMerchants } from '../controllers/merchantController';

const router = Router();

router.post('/', createMerchant);
router.get('/', getAllMerchants);
router.put('/:id', updateMerchant);
router.get('/:id', getMerchantById);

export default router;
