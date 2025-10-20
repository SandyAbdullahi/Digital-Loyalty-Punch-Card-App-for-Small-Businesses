import { Router } from 'express';
import { createLoyaltyProgram, getLoyaltyProgramsByMerchantId, getLoyaltyProgramById, updateLoyaltyProgram, deleteLoyaltyProgram, getLoyaltyProgramQrCode } from '../controllers/loyaltyProgramController';

const router = Router();

router.post('/', createLoyaltyProgram);
router.get('/merchant/:merchantId', getLoyaltyProgramsByMerchantId);
router.get('/:id', getLoyaltyProgramById);
router.put('/:id', updateLoyaltyProgram);
router.delete('/:id', deleteLoyaltyProgram);
router.get('/:id/qrcode', getLoyaltyProgramQrCode);

export default router;