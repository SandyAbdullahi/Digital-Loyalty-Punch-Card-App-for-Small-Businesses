
import { Router } from 'express';
import { createMerchant, updateMerchant, getMerchantById, getAllMerchants, issueStamp, getCustomersByMerchantId } from '../controllers/merchantController';

const router = Router();

router.post('/', createMerchant);
router.get('/', getAllMerchants);
router.put('/:id', updateMerchant);
router.get('/:id', getMerchantById);
router.post('/:merchantId/issue-stamp', issueStamp);
router.get('/:merchantId/customers', getCustomersByMerchantId);

export default router;
