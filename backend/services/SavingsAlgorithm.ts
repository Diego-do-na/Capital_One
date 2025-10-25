// src/services/SavingsAlgorithm.ts
import { getRecentPurchases, createTransfer } from './NessieService';
import { Purchase } from '../types/nessie';

// NOTA: En un proyecto real, se obtendría el threshold y el fondoId de la base de datos
const MOCK_INVESTMENT_ACCOUNT_ID = 'MOCK_FUND_ACCOUNT_ID_FROM_NESSY'; // SIMULACIÓN
const DEFAULT_THRESHOLD = 5.00; // SIMULACIÓN

/**
 * Algoritmo principal para identificar gastos hormiga y procesar la transferencia.
 * @param customerAccountId La cuenta del cliente a analizar.
 * @param currentThreshold El umbral máximo para considerar un gasto como hormiga (ej. $5.00).
 * @returns Resumen de la operación (monto transferido y número de gastos procesados).
 */
export async function processHormigaSavings(
    customerAccountId: string,
    currentThreshold: number = DEFAULT_THRESHOLD // Se puede obtener de la DB
) {
    if (currentThreshold <= 0) {
        return {
            message: 'Umbral de ahorro no configurado o inválido.',
            transferredAmount: 0,
            purchasesCount: 0,
        };
    }

    // 1. Obtener las compras recientes del cliente
    const recentPurchases: Purchase[] = await getRecentPurchases(customerAccountId);

    // 2. Aplicar la lógica del "Gasto Hormiga" (El Algoritmo)
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

    // 3. Calcular el "Costo Doble" (la suma de los gastos hormiga)
    const totalAmountToTransfer = hormigaPurchases.reduce(
        (sum, purchase) => sum + purchase.amount,
        0
    );

    // 4. Ejecutar la transferencia simulada (la esencia del proyecto)
    try {
        const transferResult = await createTransfer(
            customerAccountId,
            MOCK_INVESTMENT_ACCOUNT_ID,
            totalAmountToTransfer
        );

        return {
            message: 'Ahorro Hormiga procesado exitosamente.',
            transferredAmount: totalAmountToTransfer.toFixed(2),
            purchasesCount: hormigaPurchases.length,
            transferId: transferResult._id,
        };
    } catch (error) {
        console.error('Fallo el proceso de ahorro hormiga:', error);
        throw new Error('Error al ejecutar la transferencia del ahorro hormiga.');
    }
}