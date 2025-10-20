import { Router } from 'express';
import { createSubscription, getSubscriptionByMerchantId, updateSubscription, cancelSubscription } from '../controllers/subscriptionController';

const router = Router();

router.post('/', createSubscription);
router.get('/merchant/:merchantId', getSubscriptionByMerchantId);
router.put('/:id', updateSubscription);
router.post('/:id/cancel', cancelSubscription);

export default router;
