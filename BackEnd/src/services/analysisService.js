// services/analysisService.js - VERSIÓN SIMPLIFICADA
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
    const isHormigaByAmount = transaction.amount <= rules.maxAmount;
    const isHormigaByCategory = rules.categories.includes(transaction.category);
    
    return isHormigaByAmount && isHormigaByCategory;
  });
};

export const categorizeTransaction = (description) => {
  if (!description) return 'other';
  
  const desc = description.toLowerCase();
  
  if (desc.includes('coffee') || desc.includes('starbucks') || desc.includes('café') || desc.includes('cafe')) 
    return 'coffee';
  if (desc.includes('mcdonalds') || desc.includes('burger') || desc.includes('fast food') || desc.includes('comida rápida')) 
    return 'fast_food';
  if (desc.includes('dunkin') || desc.includes('donut')) 
    return 'snacks';
  if (desc.includes('walmart') || desc.includes('supermarket') || desc.includes('grocery') || desc.includes('supermercado')) 
    return 'groceries';
  
  return 'other';
};

// Solo exporta estas dos funciones esenciales
export default {
  analyzeForHormiga,
  categorizeTransaction
};