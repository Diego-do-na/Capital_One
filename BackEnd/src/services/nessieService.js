// Servicio para interactuar con Nessie API
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const nessieAPI = axios.create({
  baseURL: 'https://api.nessieisreal.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add API key to all requests
nessieAPI.interceptors.request.use((config) => {
  config.params = { ...config.params, key: process.env.NESSIE_API_KEY };
  return config;
});

// Customer operations
export const getCustomerAccounts = async (customerId) => {
  try {
    const response = await nessieAPI.get(`/customers/${customerId}/accounts`);
    return response.data;
  } catch (error) {
    console.error('Error getting customer accounts:', error.response?.data || error.message);
    throw new Error(`No se pudieron obtener las cuentas del cliente: ${error.message}`);
  }
};

export const getCustomer = async (customerId) => {
  try {
    const response = await nessieAPI.get(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting customer:', error.response?.data || error.message);
    throw new Error(`No se pudo obtener el cliente: ${error.message}`);
  }
};

// Account operations
export const getAccountPurchases = async (accountId) => {
  try {
    const response = await nessieAPI.get(`/accounts/${accountId}/purchases`);
    return response.data;
  } catch (error) {
    console.error('Error getting account purchases:', error.response?.data || error.message);
    throw new Error(`No se pudieron obtener las compras: ${error.message}`);
  }
};

export const getAccount = async (accountId) => {
  try {
    const response = await nessieAPI.get(`/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting account:', error.response?.data || error.message);
    throw new Error(`No se pudo obtener la cuenta: ${error.message}`);
  }
};

// Transfer operations
export const createTransfer = async (fromAccountId, amount, description = 'Mirror Savings Transfer') => {
  try {
    // Primero necesitamos obtener una cuenta de ahorros para transferir
    const accounts = await getCustomerAccounts('customer_id_here'); // Esto debería venir del usuario
    
    const savingsAccount = accounts.find(acc => acc.type === 'savings');
    if (!savingsAccount) {
      throw new Error('No se encontró cuenta de ahorros');
    }
    
    const response = await nessieAPI.post(`/accounts/${fromAccountId}/transfers`, {
      medium: 'balance',
      payee_id: savingsAccount._id,
      amount: amount,
      description: description
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating transfer:', error.response?.data || error.message);
    throw new Error(`No se pudo realizar la transferencia: ${error.message}`);
  }
};

// Purchase operations
export const createPurchase = async (accountId, purchaseData) => {
  try {
    const response = await nessieAPI.post(`/accounts/${accountId}/purchases`, purchaseData);
    return response.data;
  } catch (error) {
    console.error('Error creating purchase:', error.response?.data || error.message);
    throw new Error(`No se pudo crear la compra: ${error.message}`);
  }
};

// Merchant operations
export const getMerchants = async () => {
  try {
    const response = await nessieAPI.get('/merchants');
    return response.data;
  } catch (error) {
    console.error('Error getting merchants:', error.response?.data || error.message);
    throw new Error(`No se pudieron obtener los comercios: ${error.message}`);
  }
};

// Helper function to get all purchases for a customer
export const getCustomerPurchases = async (customerId) => {
  try {
    const accounts = await getCustomerAccounts(customerId);
    let allPurchases = [];
    
    for (const account of accounts) {
      const purchases = await getAccountPurchases(account._id);
      allPurchases = allPurchases.concat(
        purchases.map(purchase => ({
          ...purchase,
          accountId: account._id,
          accountType: account.type
        }))
      );
    }
    
    return allPurchases;
  } catch (error) {
    console.error('Error getting customer purchases:', error);
    throw error;
  }
};

// Create test data
export const createTestPurchases = async (accountId) => {
  const testPurchases = [
    {
      merchant_id: "starbucks_123",
      amount: 4.75,
      purchase_date: new Date().toISOString().split('T')[0],
      description: "Morning coffee",
      status: "completed"
    },
    {
      merchant_id: "mcdonalds_456",
      amount: 8.50,
      purchase_date: new Date().toISOString().split('T')[0],
      description: "Lunch combo",
      status: "completed"
    },
    {
      merchant_id: "walmart_789",
      amount: 45.25,
      purchase_date: new Date().toISOString().split('T')[0],
      description: "Weekly groceries",
      status: "completed"
    }
  ];
  
  const createdPurchases = [];
  for (const purchase of testPurchases) {
    const result = await createPurchase(accountId, purchase);
    createdPurchases.push(result);
  }
  
  return createdPurchases;
};

export default nessieAPI;