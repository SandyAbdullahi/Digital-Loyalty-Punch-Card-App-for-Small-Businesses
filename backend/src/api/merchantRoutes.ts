
import { Router } from 'express';
import { createMerchant, updateMerchant, getMerchantById, getAllMerchants, issueStamp, getCustomersByMerchantId, updateMerchantSubscription, getNearbyMerchants, loginMerchant, updateMerchantBranding } from '../controllers/merchantController';
import { upload } from '../config/multerConfig';

const router = Router();

router.post('/', createMerchant);
router.post('/login', loginMerchant);
router.get('/', getAllMerchants);
router.put('/:id', updateMerchant);
router.get('/:id', getMerchantById);
router.post('/:merchantId/issue-stamp', issueStamp);
router.get('/:merchantId/customers', getCustomersByMerchantId);
router.put('/:id/subscribe', updateMerchantSubscription);
router.get('/nearby', getNearbyMerchants);
router.put('/:id/branding', upload.single('logo'), updateMerchantBranding);

export default router;
