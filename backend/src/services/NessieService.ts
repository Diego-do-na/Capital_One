// src/services/NessieService.ts

import axios from 'axios';
// Asegúrate de que este import use la extensión .js si estás en NodeNext
import { Purchase, Transfer, Account } from '../types/nessie.js';

const NESSY_BASE_URL = 'http://api.reimaginebanking.com';
const NESSY_API_KEY = process.env.NESSY_API_KEY;

if (!NESSY_API_KEY) {
    // Asegúrate de tener tu clave en el archivo .env
    throw new Error('NESSY_API_KEY no está configurada en .env');
}

/**
 * [MODO BATCH] Obtiene las compras recientes de una cuenta.
 * @param accountId ID de la cuenta del cliente.
 * @returns Array de objetos Purchase.
 */
export async function getRecentPurchases(accountId: string): Promise<Purchase[]> {
    const url = `${NESSY_BASE_URL}/accounts/${accountId}/purchases?key=${NESSY_API_KEY}`;
    try {
        const response = await axios.get(url);

        // Filtrar para obtener solo las compras de los últimos 7 días
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        return response.data.filter((p: Purchase) => new Date(p.purchase_date) > oneWeekAgo);

    } catch (error) {
        console.error('Error al obtener compras de Nessie:', error.response?.data || error);
        throw new Error('Fallo la conexión con Nessie para obtener compras.');
    }
}

/**
 * [AMBOS MODOS] Crea una transferencia simulada de la cuenta del cliente al "fondo de inversión".
 * @param fromAccountId ID de la cuenta del cliente.
 * @param toAccountId ID de la cuenta destino (simulación del fondo de inversión).
 * @param amount Monto a transferir (el costo doble/espejo).
 * @returns Objeto Transfer.
 */
export async function createTransfer(
    fromAccountId: string,
    toAccountId: string,
    amount: number
): Promise<Transfer> {
    const url = `${NESSY_BASE_URL}/accounts/${fromAccountId}/transfers?key=${NESSY_API_KEY}`;

    const payload = {
        medium: 'balance', // Transferir desde el saldo
        payee_id: toAccountId,
        amount: amount,
        description: `Ahorro Hormiga - Transferencia de $${amount.toFixed(2)}`,
    };

    try {
        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear la transferencia en Nessie:', error.response?.data || error);
        // Es crucial capturar y mostrar el mensaje de error de Nessie si es posible
        throw new Error('Fallo la creación de la transferencia.');
    }
}


/**
 * ⬅️ FUNCIÓN AÑADIDA: [MODO TIEMPO REAL] Obtiene los detalles de una cuenta para verificar el saldo.
 * @param accountId ID de la cuenta del cliente.
 * @returns Objeto Account.
 */
export async function getAccountDetails(accountId: string): Promise<Account> {
    const url = `${NESSY_BASE_URL}/accounts/${accountId}?key=${NESSY_API_KEY}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error al obtener detalles de cuenta de Nessie:', error.response?.data || error);
        throw new Error('Fallo la conexión con Nessie para obtener saldo.');
    }
}