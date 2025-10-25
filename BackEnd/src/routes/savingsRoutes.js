import express from 'express';
import { 
  createSavingsRecord, 
  getUserSavingsHistory, 
  getTotalSavings 
} from '../db/utils.js';
import { createTransfer } from '../services/nessieService.js';

const router = express.Router();

// POST /api/savings/transfer - Transferir dinero a ahorros
router.post('/transfer', async (req, res) => {
  try {
    const { userId, amount, transactionId, fromAccountId, toAccountId } = req.body;
    
    // 1. Hacer transferencia via Nessie API
    const transferResult = await createTransfer(fromAccountId, amount, toAccountId);
    
    // 2. Registrar en nuestra base de datos
    await createSavingsRecord({
      userId,
      amount,
      transactionId,
      fromAccountId,
      toAccountId,
      transferId: transferResult._id,
      type: 'hormiga_transfer',
      description: `Transferencia por gasto hormiga`
    });
    
    res.json({
      message: `$${amount} transferido a cuenta de ahorros`,
      transferId: transferResult._id,
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/savings/users/:userId - Obtener historial de ahorros
router.get('/users/:userId', async (req, res) => {
  try {
    const savingsHistory = await getUserSavingsHistory(req.params.userId);
    const totalSaved = await getTotalSavings(req.params.userId);
    
    res.json({
      totalSaved,
      history: savingsHistory,
      count: savingsHistory.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/savings/users/:userId/progress - Progreso de ahorros
router.get('/users/:userId/progress', async (req, res) => {
  try {
    const totalSaved = await getTotalSavings(req.params.userId);
    // Aquí necesitarías obtener la meta del usuario
    const userGoal = 1000; // Esto vendría de la base de datos
    
    res.json({
      currentSavings: totalSaved,
      goal: userGoal,
      progress: (totalSaved / userGoal) * 100,
      remaining: userGoal - totalSaved
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;