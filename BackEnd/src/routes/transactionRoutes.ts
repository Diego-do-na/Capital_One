import { Router } from 'express';
import * as transactionController from '../controllers/transactionController.js';

const router = Router();

// GET: Obtener el historial de transacciones de un cliente
router.get('/:accountId', transactionController.getTransactionsHistory);

// POST: Registrar una nueva transacción (llamado por el algoritmo después del ahorro espejo)
router.post('/', transactionController.addTransaction);

export default router;
