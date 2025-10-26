import { Router } from 'express';
import { createTransaction, getTransactionsByAccount } from '../controllers/transactionController.js';

const router = Router();

router.post('/', createTransaction);

router.get('/:accountId', getTransactionsByAccount);

export default router;