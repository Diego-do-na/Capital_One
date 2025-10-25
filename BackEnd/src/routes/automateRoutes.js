import express from 'express';
import { 
  findUnprocessedTransactions, 
  markMultipleTransactionsProcessed 
} from '../db/utils.js';
import { getCustomerPurchases } from '../services/nessieService.js';

const router = express.Router();

// POST /api/automate/process/:userId - Procesar transacciones automáticamente
router.post('/process/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // 1. Encontrar transacciones no procesadas
    const unprocessedTransactions = await findUnprocessedTransactions(userId);
    
    if (unprocessedTransactions.length === 0) {
      return res.json({ 
        message: 'No hay transacciones nuevas para procesar',
        processed: 0 
      });
    }
    
    // 2. Aquí iría la lógica para hacer las transferencias
    const transactionsToProcess = unprocessedTransactions.slice(0, 5); // Límite por seguridad
    
    // 3. Marcar como procesadas (en un caso real, después de hacer la transferencia)
    const transactionIds = transactionsToProcess.map(tx => tx._id);
    await markMultipleTransactionsProcessed(transactionIds);
    
    res.json({
      message: `Procesadas ${transactionsToProcess.length} transacciones hormiga`,
      processed: transactionsToProcess.length,
      totalAmount: transactionsToProcess.reduce((sum, tx) => sum + tx.amount, 0),
      transactions: transactionsToProcess
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/automate/status/:userId - Obtener estado de automatización
router.get('/status/:userId', async (req, res) => {
  try {
    const unprocessedTransactions = await findUnprocessedTransactions(req.params.userId);
    
    res.json({
      pendingTransactions: unprocessedTransactions.length,
      pendingAmount: unprocessedTransactions.reduce((sum, tx) => sum + tx.amount, 0),
      lastChecked: new Date(),
      isActive: unprocessedTransactions.length > 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;