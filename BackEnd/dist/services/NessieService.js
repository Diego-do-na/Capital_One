import axios from 'axios';
import {} from '../types/nessie.js';
const MOCK_ACCOUNT_BALANCE = 1000.00;
const MOCK_TRANSFER_ID = "mock_transfer_9999";
const MOCK_CUSTOMER_ACCOUNT_ID = '66778899aabbccddeeff0011';
export async function getRecentPurchases(accountId) {
    console.log("MOCK: Obteniendo compras recientes...");
    const mockPurchases = [
        { _id: 'p1', type: 'purchase', purchase_date: new Date().toISOString(), amount: 1.50, description: 'Café', status: 'completed', merchant_id: 'm1', account_id: accountId },
        { _id: 'p2', type: 'purchase', purchase_date: new Date().toISOString(), amount: 3.20, description: 'Snack', status: 'completed', merchant_id: 'm1', account_id: accountId },
        { _id: 'p3', type: 'purchase', purchase_date: new Date().toISOString(), amount: 12.99, description: 'Almuerzo grande', status: 'completed', merchant_id: 'm2', account_id: accountId }, // No hormiga
        { _id: 'p4', type: 'purchase', purchase_date: new Date().toISOString(), amount: 4.90, description: 'Helado', status: 'completed', merchant_id: 'm3', account_id: accountId },
    ];
    return Promise.resolve(mockPurchases);
}
export async function createTransfer(fromAccountId, toAccountId, amount) {
    console.log(`MOCK: Transferencia simulada de $${amount.toFixed(2)} a ${toAccountId}.`);
    const mockTransfer = {
        _id: MOCK_TRANSFER_ID,
        type: 'transfer',
        transaction_date: new Date().toISOString(),
        amount: amount,
        description: `MOCK Ahorro Hormiga - Transferencia de $${amount.toFixed(2)}`,
        status: 'pending',
        payer_id: fromAccountId,
        payee_id: toAccountId,
    };
    return Promise.resolve(mockTransfer);
}
export async function getAccountDetails(accountId) {
    console.log("MOCK: Obteniendo saldo de cuenta...");
    const mockAccount = {
        _id: accountId,
        type: 'Savings',
        nickname: 'Cuenta Hackathon MOCK',
        rewards: 500,
        balance: MOCK_ACCOUNT_BALANCE,
        customer_id: 'MOCK_CUSTOMER_ID'
    };
    return Promise.resolve(mockAccount);
}
