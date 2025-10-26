// frontend/src/utils/api.js

import axios from 'axios';

const BACKEND_URL = '/api/savings';
const TRANSACTION_URL = '/api/transactions';

// ID FIJO DEL CLIENTE ÚNICO
const TEST_ACCOUNT_ID = 'TEST_HACKATHON_USER';

// ==========================================================
// Funciones de Saldo y Ahorro (Persistencia)
// ==========================================================

// ⬅️ FUNCIÓN OMITIDA: setThreshold (ya no se usa)

/**
 * Obtiene el estado persistente del cliente (saldo y ahorro) para el inicio.
 */
// frontend/src/utils/api.js (en getInitialData)

export async function getInitialData() {
    try {
        const response = await axios.get(`${BACKEND_URL}/status/${TEST_ACCOUNT_ID}`);
        const data = response.data;

        // ⬅️ ASUMIMOS QUE LA RESPUESTA ES data.saldoNormal, NO data.data.saldoNormal
        return {
            ahorroTotal: data.ahorroTotal,
            saldoNormal: data.saldoNormal,
        };

    } catch (error) {
        // ... (el resto de la función)
        // Usamos valores seguros si falla la conexión
        return {
            ahorroTotal: 0.00,
            saldoNormal: 10000.00,
        };
    }
}

/**
 * 2. Llama al backend para ejecutar el algoritmo de ahorro espejo (con datos de ML).
 */
export async function executeMirrorSavings(purchaseAmount, categoria, establecimiento) {
    try {
        const response = await axios.post(`${BACKEND_URL}/mirror`, {
            purchaseAmount,
            categoria,
            establecimiento,
            accountId: TEST_ACCOUNT_ID
        });
        return response.data.data; // Devuelve el resultado del ML y el espejo
    } catch (error) {
        throw new Error(error.response?.data?.error || "Fallo la transferencia espejo.");
    }
}

// ==========================================================
// Funciones de Historial (MongoDB)
// ==========================================================

/**
 * 3. Guarda la transacción y el resultado del algoritmo en el historial de la DB.
 */
export async function saveTransaction(monto, categoria, establecimiento, result) {
    try {
        const payload = {
            monto,
            categoria,
            establecimiento,
            accountId: TEST_ACCOUNT_ID,
            isHormiga: result.validation === 'SUCCESS',
            transferAmount: parseFloat(result.transferredAmount) || 0,
            message: result.message,
        };

        await axios.post(TRANSACTION_URL, payload);
    } catch (error) {
        console.error("Error al guardar la transacción en el historial:", error);
    }
}

/**
 * 4. Obtiene todo el historial de transacciones para mostrar.
 */
export async function getHistory() {
    try {
        const response = await axios.get(`${TRANSACTION_URL}/${TEST_ACCOUNT_ID}`);
        return response.data.history;
    } catch (error) {
        console.error("Error al obtener el historial:", error);
        return [];
    }
}