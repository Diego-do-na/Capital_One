// src/services/SavingsAlgorithm.ts

// Importamos las funciones de la capa de servicio de Nessie
import { getRecentPurchases, createTransfer, getAccountDetails } from './NessieService.js';
import { Purchase } from '../types/nessie.js';

// MOCK: ID de la cuenta simulada que representa el fondo de inversión
// En un proyecto real, necesitarías crear una cuenta Savings o Checking en Nessie para esto
const MOCK_INVESTMENT_ACCOUNT_ID = 'MOCK_FUND_ACCOUNT_ID_FROM_NESSY';
const DEFAULT_THRESHOLD = 5.00;

/**
 * 1. ALGORITMO BATCH (HISTÓRICO)
 * Procesa todas las compras hormiga recientes y ejecuta una ÚNICA transferencia.
 * Se usa para la ejecución periódica.
 */
export async function processHormigaSavings(
    customerAccountId: string,
    currentThreshold: number = DEFAULT_THRESHOLD
) {
    if (currentThreshold <= 0) {
        return {
            message: 'Umbral de ahorro no configurado o inválido.',
            transferredAmount: 0,
            purchasesCount: 0,
        };
    }

    // 1. Obtener las compras recientes del cliente (ej. última semana)
    const recentPurchases: Purchase[] = await getRecentPurchases(customerAccountId);

    // 2. Aplicar la lógica del "Gasto Hormiga"
    const hormigaPurchases = recentPurchases.filter(
        (purchase) => purchase.amount > 0 && purchase.amount <= currentThreshold
    );

    if (hormigaPurchases.length === 0) {
        return {
            message: 'No se encontraron gastos hormiga bajo el umbral.',
            transferredAmount: 0,
            purchasesCount: 0,
        };
    }

    // 3. Calcular el "Costo Doble" total (suma de todos los gastos hormiga)
    const totalAmountToTransfer = hormigaPurchases.reduce(
        (sum, purchase) => sum + purchase.amount,
        0
    );

    // 4. Ejecutar la transferencia simulada
    try {
        const transferResult = await createTransfer(
            customerAccountId,
            MOCK_INVESTMENT_ACCOUNT_ID,
            totalAmountToTransfer
        );

        return {
            message: 'Ahorro Hormiga (Batch) procesado exitosamente.',
            transferredAmount: totalAmountToTransfer.toFixed(2),
            purchasesCount: hormigaPurchases.length,
            transferId: transferResult._id,
        };
    } catch (error) {
        console.error('Fallo el proceso de ahorro hormiga (Batch):', error);
        throw new Error('Error al ejecutar la transferencia del ahorro hormiga (Batch).');
    }
}


/**
 * 2. ALGORITMO TIEMPO REAL (ESPEJO)
 * Procesa una compra individual, valida el saldo disponible y ejecuta la transferencia espejo.
 * Se usa para simular la detección de compra inmediata.
 */
export async function processMirrorSavings(
    customerAccountId: string,
    purchaseAmount: number,
    currentThreshold: number
) {
    const amountToMirror = purchaseAmount;

    // 1. Verificar si el monto es un Gasto Hormiga válido
    if (amountToMirror <= 0 || amountToMirror > currentThreshold) {
        return {
            message: 'La compra no califica como gasto hormiga o el monto es inválido.',
            transferredAmount: 0,
            validation: 'SKIP',
        };
    }

    // 2. Obtener Saldo Actual y Validar Fondos
    // Utilizamos getAccountDetails para obtener el balance antes de transferir
    const accountInfo = await getAccountDetails(customerAccountId);
    const currentBalance = accountInfo.balance;

    // Si el saldo remanente es menor al monto espejo, la validación falla.
    if (currentBalance < amountToMirror) {
        console.warn(`Saldo de $${currentBalance} insuficiente para espejo de $${amountToMirror}.`);
        return {
            message: `Saldo insuficiente ($${currentBalance.toFixed(2)}) para el ahorro espejo de $${amountToMirror.toFixed(2)}.`,
            transferredAmount: 0,
            validation: 'FAILED_BALANCE',
        };
    }

    // 3. Ejecutar la Transferencia Espejo (Descuento Automático)
    try {
        const transferResult = await createTransfer(
            customerAccountId,
            MOCK_INVESTMENT_ACCOUNT_ID,
            amountToMirror
        );

        return {
            message: 'Ahorro espejo procesado exitosamente.',
            transferredAmount: amountToMirror.toFixed(2),
            validation: 'SUCCESS',
            transferId: transferResult._id,
        };
    } catch (error) {
        console.error('Fallo la transferencia del ahorro espejo:', error);
        throw new Error('Error al ejecutar la transferencia del ahorro espejo.');
    }
}