
import { Router } from 'express';
import { createMerchant, updateMerchant, getMerchantById, getAllMerchants, issueStamp, getCustomersByMerchantId, updateMerchantSubscription } from '../controllers/merchantController';

const router = Router();

router.post('/', createMerchant);
router.get('/', getAllMerchants);
router.put('/:id', updateMerchant);
router.get('/:id', getMerchantById);
router.post('/:merchantId/issue-stamp', issueStamp);
router.get('/:merchantId/customers', getCustomersByMerchantId);
router.put('/:id/subscribe', updateMerchantSubscription);

export default router;
