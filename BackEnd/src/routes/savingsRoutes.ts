import { Router } from 'express';

import * as savingsController from '../controllers/savingsController.js';

const router = Router();

router.post('/process', savingsController.processSavings);
router.put('/threshold', savingsController.setSavingsThreshold);
router.post('/mirror', savingsController.mirrorSavings);
router.get('/', savingsController.getSavings);

export default router;