import express from 'express';
import { 
  findTransactionsByUser, 
  getHormigaStats, 
  getTopHormigaCategories,
  saveMultipleTransactions 
} from '../db/utils.js';
import { analyzeForHormiga, categorizeTransaction } from '../services/analysisService.js';
import { getCustomerPurchases } from '../services/nessieService.js';

const router = express.Router();

// GET /api/transactions/users/:userId - Obtener transacciones con análisis
router.get('/users/:userId', async (req, res) => {
  try {
    // 1. Obtener transacciones de la base de datos
    const transactions = await findTransactionsByUser(req.params.userId);
    
    // 2. Obtener estadísticas
    const stats = await getHormigaStats(req.params.userId);
    const topCategories = await getTopHormigaCategories(req.params.userId);
    
    res.json({
      transactions,
      stats: {
        ...stats,
        topCategories
      },
      count: transactions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/transactions/analyze - Analizar transacciones para gastos hormiga
router.post('/analyze', async (req, res) => {
  try {
    const { transactions } = req.body;
    
    // Analizar cada transacción
    const analyzedTransactions = transactions.map(transaction => ({
      ...transaction,
      category: categorizeTransaction(transaction.description),
      isHormiga: analyzeForHormiga([transaction]).length > 0
    }));
    
    const hormigaTransactions = analyzedTransactions.filter(tx => tx.isHormiga);
    
    res.json({
      analyzedTransactions,
      hormigaCount: hormigaTransactions.length,
      totalHormigaAmount: hormigaTransactions.reduce((sum, tx) => sum + tx.amount, 0),
      summary: `Encontraste ${hormigaTransactions.length} gastos hormiga`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/transactions/sync - Sincronizar transacciones de Nessie
router.post('/sync', async (req, res) => {
  try {
    const { userId, nessieCustomerId } = req.body;
    
    // 1. Obtener transacciones de Nessie
    const nessiePurchases = await getCustomerPurchases(nessieCustomerId);
    
    // 2. Convertir a nuestro formato y analizar
    const transactionsToSave = nessiePurchases.map(purchase => ({
      userId,
      nessiePurchaseId: purchase._id,
      amount: purchase.amount,
      merchantId: purchase.merchant_id,
      purchaseDate: purchase.purchase_date,
      description: purchase.description,
      category: categorizeTransaction(purchase.description),
      isHormiga: analyzeForHormiga([{ 
        amount: purchase.amount, 
        category: categorizeTransaction(purchase.description) 
      }]).length > 0,
      isProcessed: false
    }));
    
    // 3. Guardar en nuestra base de datos
    const savedTransactions = await saveMultipleTransactions(transactionsToSave);
    
    res.json({
      message: `${transactionsToSave.length} transacciones sincronizadas`,
      savedCount: savedTransactions.insertedCount,
      hormigaCount: transactionsToSave.filter(tx => tx.isHormiga).length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;