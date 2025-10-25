// Servicio para operaciones de ahorro
import { createTransfer } from './nessieService.js';
import { createSavingsRecord } from '../db/utils.js';

export const processHormigaSavings = async (userId, hormigaTransactions, fromAccountId, toAccountId) => {
  try {
    const results = [];
    
    for (const transaction of hormigaTransactions) {
      try {
        // 1. Realizar transferencia via Nessie
        const transferResult = await createTransfer(
          fromAccountId, 
          transaction.amount, 
          `Mirror: Ahorro por gasto hormiga - ${transaction.description}`
        );
        
        // 2. Registrar en nuestra base de datos
        const savingsRecord = await createSavingsRecord({
          userId,
          amount: transaction.amount,
          transactionId: transaction._id,
          fromAccountId,
          toAccountId,
          transferId: transferResult._id,
          type: 'hormiga_transfer',
          description: `Ahorro automático: ${transaction.description}`,
          originalTransaction: {
            amount: transaction.amount,
            merchant: transaction.merchantId,
            description: transaction.description,
            category: transaction.category
          }
        });
        
        results.push({
          success: true,
          transactionId: transaction._id,
          amount: transaction.amount,
          transferId: transferResult._id,
          savingsRecordId: savingsRecord.insertedId
        });
        
      } catch (error) {
        results.push({
          success: false,
          transactionId: transaction._id,
          amount: transaction.amount,
          error: error.message
        });
      }
    }
    
    return {
      processed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalAmount: results.filter(r => r.success).reduce((sum, r) => sum + r.amount, 0),
      details: results
    };
  } catch (error) {
    throw new Error(`Error procesando ahorros: ${error.message}`);
  }
};

export const calculateCompoundSavings = (monthlySavings, months, annualInterestRate = 0.02) => {
  const monthlyRate = annualInterestRate / 12;
  let futureValue = 0;
  
  for (let i = 0; i < months; i++) {
    futureValue = (futureValue + monthlySavings) * (1 + monthlyRate);
  }
  
  return {
    totalContributions: monthlySavings * months,
    interestEarned: futureValue - (monthlySavings * months),
    futureValue: futureValue,
    months: months
  };
};

export const generateSavingsPlan = (currentHormigaSpending, goalAmount, timeframeMonths = 12) => {
  const monthlyHormigaSavings = currentHormigaSpending;
  const additionalMonthlyNeeded = (goalAmount - (monthlyHormigaSavings * timeframeMonths)) / timeframeMonths;
  
  return {
    goalAmount,
    timeframeMonths,
    monthlyHormigaSavings,
    additionalMonthlyNeeded: Math.max(0, additionalMonthlyNeeded),
    totalMonthlySavings: monthlyHormigaSavings + Math.max(0, additionalMonthlyNeeded),
    projectedTotal: calculateCompoundSavings(
      monthlyHormigaSavings + Math.max(0, additionalMonthlyNeeded), 
      timeframeMonths
    ).futureValue
  };
};

export const validateTransfer = (transaction, userAccount) => {
  const errors = [];
  
  if (transaction.amount <= 0) {
    errors.push('El monto debe ser mayor a 0');
  }
  
  if (!userAccount) {
    errors.push('No se encontró la cuenta del usuario');
  }
  
  if (transaction.amount > userAccount.balance) {
    errors.push('Fondos insuficientes');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  processHormigaSavings,
  calculateCompoundSavings,
  generateSavingsPlan,
  validateTransfer
};