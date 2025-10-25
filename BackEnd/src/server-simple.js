// src/server-simple.js - COPIA Y PEGA ESTO
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check básico
app.get('/', (req, res) => {
  res.json({ 
    message: '🎉 ¡Mirror API funcionando!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de prueba para gastos hormiga
app.post('/api/analyze', (req, res) => {
  const { transactions } = req.body;
  
  // Lógica simple de gastos hormiga
  const hormigaTransactions = transactions.filter(tx => 
    tx.amount < 15 && 
    ['coffee', 'fast_food', 'snacks'].includes(tx.category)
  );
  
  res.json({
    analyzed: transactions.length,
    hormigaCount: hormigaTransactions.length,
    totalHormiga: hormigaTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    message: `Encontraste ${hormigaTransactions.length} gastos hormiga`
  });
});

// Endpoint para simular transferencia
app.post('/api/savings/transfer', (req, res) => {
  const { amount } = req.body;
  
  res.json({
    success: true,
    message: `$${amount} transferido a ahorros exitosamente`,
    transferId: 'sim_' + Date.now()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mirror API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});