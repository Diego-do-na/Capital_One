import { getDB } from '../config/db.js';

// ==================== COLLECTION GETTERS ====================
export const usersCollection = () => getDB().collection('users');
export const transactionsCollection = () => getDB().collection('transactions');
export const savingsCollection = () => getDB().collection('savings');

// ==================== USER FUNCTIONS ====================
export const createUser = async (userData) => {
  return await usersCollection().insertOne({
    ...userData,
    savingsGoal: 0,
    hormigaRules: {
      maxAmount: 15,
      categories: ['coffee', 'fast_food', 'snacks'],
      isActive: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

export const findUserById = async (userId) => {
  return await usersCollection().findOne({ _id: userId });
};

export const findUserByEmail = async (email) => {
  return await usersCollection().findOne({ email });
};

export const updateUserSavingsGoal = async (userId, goal) => {
  return await usersCollection().updateOne(
    { _id: userId },
    { 
      $set: { 
        savingsGoal: goal,
        updatedAt: new Date() 
      } 
    }
  );
};

export const updateUserHormigaRules = async (userId, rules) => {
  return await usersCollection().updateOne(
    { _id: userId },
    { 
      $set: { 
        hormigaRules: rules,
        updatedAt: new Date() 
      } 
    }
  );
};

// ==================== TRANSACTION FUNCTIONS ====================
export const saveTransaction = async (transactionData) => {
  return await transactionsCollection().insertOne({
    ...transactionData,
    isProcessed: false,
    createdAt: new Date()
  });
};

export const findTransactionsByUser = async (userId, limit = 50) => {
  return await transactionsCollection()
    .find({ userId })
    .sort({ purchaseDate: -1 })
    .limit(limit)
    .toArray();
};

export const findUnprocessedTransactions = async (userId) => {
  return await transactionsCollection()
    .find({ 
      userId, 
      isProcessed: false,
      isHormiga: true 
    })
    .toArray();
};

export const markTransactionProcessed = async (transactionId) => {
  return await transactionsCollection().updateOne(
    { _id: transactionId },
    { 
      $set: { 
        isProcessed: true, 
        processedAt: new Date() 
      } 
    }
  );
};

export const updateTransactionHormigaStatus = async (transactionId, isHormiga) => {
  return await transactionsCollection().updateOne(
    { _id: transactionId },
    { 
      $set: { 
        isHormiga: isHormiga,
        updatedAt: new Date() 
      } 
    }
  );
};

// ==================== SAVINGS FUNCTIONS ====================
export const createSavingsRecord = async (savingsData) => {
  return await savingsCollection().insertOne({
    ...savingsData,
    createdAt: new Date()
  });
};

export const getUserSavingsHistory = async (userId, limit = 20) => {
  return await savingsCollection()
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
};

export const getTotalSavings = async (userId) => {
  const result = await savingsCollection().aggregate([
    { $match: { userId } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]).toArray();
  
  return result.length > 0 ? result[0].total : 0;
};

// ==================== ANALYTICS FUNCTIONS ====================
export const getHormigaStats = async (userId) => {
  const stats = await transactionsCollection().aggregate([
    { $match: { userId, isHormiga: true } },
    { 
      $group: {
        _id: null,
        totalHormigaAmount: { $sum: '$amount' },
        totalHormigaCount: { $sum: 1 },
        averageHormiga: { $avg: '$amount' }
      }
    }
  ]).toArray();

  return stats.length > 0 ? stats[0] : { 
    totalHormigaAmount: 0, 
    totalHormigaCount: 0, 
    averageHormiga: 0 
  };
};

export const getTopHormigaCategories = async (userId) => {
  return await transactionsCollection().aggregate([
    { $match: { userId, isHormiga: true } },
    { 
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } },
    { $limit: 5 }
  ]).toArray();
};

// ==================== BULK OPERATIONS ====================
export const saveMultipleTransactions = async (transactions) => {
  if (transactions.length === 0) return [];
  
  const transactionsWithTimestamp = transactions.map(tx => ({
    ...tx,
    createdAt: new Date(),
    isProcessed: false
  }));
  
  return await transactionsCollection().insertMany(transactionsWithTimestamp);
};

export const markMultipleTransactionsProcessed = async (transactionIds) => {
  return await transactionsCollection().updateMany(
    { _id: { $in: transactionIds } },
    { 
      $set: { 
        isProcessed: true, 
        processedAt: new Date() 
      } 
    }
  );
};

// Export all functions
export default {
  // User functions
  createUser,
  findUserById,
  findUserByEmail,
  updateUserSavingsGoal,
  updateUserHormigaRules,
  
  // Transaction functions
  saveTransaction,
  findTransactionsByUser,
  findUnprocessedTransactions,
  markTransactionProcessed,
  updateTransactionHormigaStatus,
  saveMultipleTransactions,
  markMultipleTransactionsProcessed,
  
  // Savings functions
  createSavingsRecord,
  getUserSavingsHistory,
  getTotalSavings,
  
  // Analytics functions
  getHormigaStats,
  getTopHormigaCategories,
  
  // Collection getters
  usersCollection,
  transactionsCollection,
  savingsCollection
};