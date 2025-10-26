// src/routes/transactionRoutes.ts

import { Router } from 'express';
import * as transactionController from '../controllers/transactionController.js';

const router = Router();

router.get('/:accountId', transactionController.getTransactionsHistory);
router.post('/', transactionController.addTransaction);

export default router;