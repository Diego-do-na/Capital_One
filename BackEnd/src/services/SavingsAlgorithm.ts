// src/services/SavingsAlgorithm.ts

import { createTransfer, getAccountDetails } from './NessieService.js';
import type { SavingsProcessResult } from '../types/nessie.js';

const MOCK_INVESTMENT_ACCOUNT_ID = '68fd2f9b9683f20dd51a476b';

/**
 * FUNCIÓN ML SIMULADA: En la vida real, aquí harías una petición HTTP a tu servidor Python (p.ej., http://localhost:8000/predict).
 */
async function classifyGastoML(purchaseAmount: number, categoria: string, establecimiento: string): Promise<boolean> {
    console.log(`ML MOCK: Clasificando $${purchaseAmount} (${categoria}, ${establecimiento})...`);

    // 🚨 Lógica de Clasificación ML MOCK:
    // Simula que el modelo clasifica gastos pequeños en categorías comunes como hormiga.
    if (purchaseAmount > 0 && purchaseAmount <= 5.00) {
        // En el mock, clasificaremos cualquier gasto menor a 5.00 como hormiga
        return Promise.resolve(true);
    }

    return Promise.resolve(false);
}

/**
 * ALGORITMO TIEMPO REAL (ESPEJO) - Impulsado por ML
 */
export async function processMirrorSavings(
    customerAccountId: string,
    purchaseAmount: number,
    categoria: string,
    establecimiento: string
): Promise<SavingsProcessResult> {

    const amountToMirror = purchaseAmount;

    // 1. CLASIFICACIÓN DE MACHINE LEARNING
    // src/services/SavingsAlgorithm.ts (Dentro de processMirrorSavings)

// ...

// 1. CLASIFICACIÓN DE MACHINE LEARNING
    try {
        const isHormigaML = await classifyGastoML(amountToMirror, categoria, establecimiento);
        // ...
    } catch (e) {
        // Si la función classifyGastoML lanza un error (por ejemplo, TypeError),
        // esta excepción es atrapada y la función processMirrorSavings falla.
        console.error("Error en la clasificación ML:", e);
        throw new Error("Fallo en el servicio de clasificación de gastos."); // Lanza un error genérico
    }

    /**if (!isHormigaML) {
        return {
            message: `Gasto de $${amountToMirror.toFixed(2)} clasificado como NO hormiga por el modelo ML.`,
            transferredAmount: 0,
            validation: 'SKIP',
        } as SavingsProcessResult;
    }*/

    // 2. Obtener Saldo Actual y Validar Fondos
    const accountInfo = await getAccountDetails(customerAccountId);
    const currentBalance = accountInfo.balance;

    if (currentBalance < amountToMirror) {
        console.warn(`Saldo de $${currentBalance} insuficiente para espejo de $${amountToMirror}.`);
        return {
            message: `Saldo insuficiente ($${currentBalance.toFixed(2)}) para el ahorro espejo de $${amountToMirror.toFixed(2)}.`,
            transferredAmount: 0,
            validation: 'FAILED_BALANCE',
        } as SavingsProcessResult;
    }

    // 3. Ejecutar la Transferencia Espejo
    try {
        const transferResult = await createTransfer(
            customerAccountId,
            MOCK_INVESTMENT_ACCOUNT_ID,
            amountToMirror
        );

        return {
            message: `Ahorro espejo aprobado por ML. Transferencia de $${amountToMirror.toFixed(2)} ejecutada.`,
            transferredAmount: amountToMirror.toFixed(2),
            validation: 'SUCCESS',
            transferId: transferResult._id,
        } as SavingsProcessResult;
    } catch (error) {
        console.error('Fallo la transferencia del ahorro espejo:', error);
        throw new Error('Error al ejecutar la transferencia del ahorro espejo.');
    }
}