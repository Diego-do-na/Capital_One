// Servicio para análisis de gastos hormiga
import { categorizeTransaction } from './categorizationService.js';

export const analyzeForHormiga = (transactions, userRules = null) => {
  const defaultRules = {
    maxAmount: 15,
    categories: ['coffee', 'fast_food', 'snacks', 'entertainment'],
    isActive: true
  };
  
  const rules = userRules || defaultRules;
  
  if (!rules.isActive) {
    return [];
  }
  
  return transactions.filter(transaction => {
    // Verificar si es un gasto hormiga basado en reglas
    const isHormigaByAmount = transaction.amount <= rules.maxAmount;
    const isHormigaByCategory = rules.categories.includes(transaction.category);
    const isFrequent = isFrequentPurchase(transaction, transactions);
    
    return isHormigaByAmount && isHormigaByCategory && isFrequent;
  });
};

export const categorizeTransaction = (description) => {
  if (!description) return 'other';
  
  const desc = description.toLowerCase();
  
  // Gastos hormiga comunes
  if (desc.includes('coffee') || desc.includes('starbucks') || desc.includes('café') || desc.includes('cafe')) 
    return 'coffee';
  if (desc.includes('mcdonalds') || desc.includes('burger') || desc.includes('fast food') || desc.includes('comida rápida')) 
    return 'fast_food';
  if (desc.includes('dunkin') || desc.includes('donut')) 
    return 'snacks';
  if (desc.includes('uber eats') || desc.includes('rapp') || desc.includes('delivery')) 
    return 'delivery';
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('subscription')) 
    return 'entertainment';
  
  // Gastos necesarios
  if (desc.includes('walmart') || desc.includes('supermarket') || desc.includes('grocery') || desc.includes('supermercado')) 
    return 'groceries';
  if (desc.includes('gas') || desc.includes('gasolina') || desc.includes('shell') || desc.includes('mobil')) 
    return 'transportation';
  if (desc.includes('electric') || desc.includes('water') || desc.includes('utility') || desc.includes('servicio')) 
    return 'utilities';
  
  return 'other';
};

export const calculateSavingsPotential = (hormigaTransactions, timeframe = 'monthly') => {
  const totalHormiga = hormigaTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  let multiplier = 1;
  switch (timeframe) {
    case 'weekly': multiplier = 4.33; break;
    case 'monthly': multiplier = 1; break;
    case 'yearly': multiplier = 12; break;
  }
  
  return {
    current: totalHormiga,
    projected: totalHormiga * multiplier,
    timeframe: timeframe,
    transactionsCount: hormigaTransactions.length
  };
};

export const isFrequentPurchase = (transaction, allTransactions) => {
  // Verificar si es una compra frecuente en el mismo comercio
  const similarTransactions = allTransactions.filter(tx => 
    tx.merchantId === transaction.merchantId || 
    tx.category === transaction.category
  );
  
  return similarTransactions.length >= 2; // Si hay al menos 2 compras similares
};

export const generateHormigaReport = (transactions, userRules) => {
  const hormigaTransactions = analyzeForHormiga(transactions, userRules);
  const savingsPotential = calculateSavingsPotential(hormigaTransactions);
  
  const categoryBreakdown = hormigaTransactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});
  
  return {
    summary: {
      totalHormigaAmount: savingsPotential.current,
      totalHormigaCount: hormigaTransactions.length,
      projectedMonthlySavings: savingsPotential.projected,
      topCategory: Object.keys(categoryBreakdown).reduce((a, b) => 
        categoryBreakdown[a] > categoryBreakdown[b] ? a : b
      )
    },
    breakdown: categoryBreakdown,
    transactions: hormigaTransactions
  };
};

export default {
  analyzeForHormiga,
  categorizeTransaction,
  calculateSavingsPotential,
  generateHormigaReport
};