
import axios from 'axios';
import { type Purchase, type Transfer, type Account } from '../types/nessie.js';

const MOCK_ACCOUNT_BALANCE = 1000.00;
const MOCK_TRANSFER_ID = "mock_transfer_9999";
const MOCK_CUSTOMER_ACCOUNT_ID = '66778899aabbccddeeff0011'; 

export async function getRecentPurchases(accountId: string): Promise<Purchase[]> {
    console.log("MOCK: Obteniendo compras recientes...");

    const mockPurchases: Purchase[] = [
        { _id: 'p1', type: 'purchase', purchase_date: new Date().toISOString(), amount: 1.50, description: 'Café', status: 'completed', merchant_id: 'm1', account_id: accountId },
        { _id: 'p2', type: 'purchase', purchase_date: new Date().toISOString(), amount: 3.20, description: 'Snack', status: 'completed', merchant_id: 'm1', account_id: accountId },
        { _id: 'p3', type: 'purchase', purchase_date: new Date().toISOString(), amount: 12.99, description: 'Almuerzo grande', status: 'completed', merchant_id: 'm2', account_id: accountId }, // No hormiga
        { _id: 'p4', type: 'purchase', purchase_date: new Date().toISOString(), amount: 4.90, description: 'Helado', status: 'completed', merchant_id: 'm3', account_id: accountId },
    ];

    return Promise.resolve(mockPurchases);
}

<<<<<<< HEAD
/**
 * [MOCK] Simula la creación exitosa de una transferencia.
 */
// src/services/NessieService.ts (Función createTransfer MOCK - Versión a prueba de errores)

/**
 * [MOCK] Simula la creación exitosa de una transferencia.
 */
=======
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
export async function createTransfer(
    fromAccountId: string,
    toAccountId: string,
    amount: number
): Promise<Transfer> {
    console.log(`MOCK: Transferencia simulada de $${amount.toFixed(2)} a ${toAccountId}.`);

    // ⬅️ Retornamos una promesa resuelta sin bloques try/catch
    const mockTransfer: Transfer = {
        _id: 'mock_transfer_9999', // Usar el ID fijo del mock
        type: 'transfer',
        transaction_date: new Date().toISOString(),
        amount: amount,
        description: `MOCK Ahorro Hormiga - Transferencia de $${amount.toFixed(2)}`,
        status: 'pending',
        payer_id: fromAccountId,
        payee_id: toAccountId,
    };
    return Promise.resolve(mockTransfer);
    // Nota: El bloque try/catch de la versión real debe estar ausente o comentado.
}

export async function getAccountDetails(accountId: string): Promise<Account> {
    console.log("MOCK: Obteniendo saldo de cuenta...");

    // Simula una cuenta con saldo suficiente
    const mockAccount: Account = {
        _id: accountId,
        type: 'Savings',
        nickname: 'Cuenta Hackathon MOCK',
        rewards: 500,
        balance: MOCK_ACCOUNT_BALANCE, // Usar la variable de saldo mockeado
        customer_id: 'MOCK_CUSTOMER_ID'
    };

    return Promise.resolve(mockAccount);
}