// src/controllers/savingsController.ts

import type { Request, Response } from 'express';
// Asegúrate de importar ambos algoritmos
import { processHormigaSavings, processMirrorSavings } from '../services/SavingsAlgorithm.js';
import type { SavingsProcessResult } from '../types/nessie.js';

// MOCK: Umbral y Cuenta simulada (idealmente, esto vendría de una DB)
const MOCK_CUSTOMER_ACCOUNT_ID = '66778899aabbccddeeff0011';
let currentSavingsThreshold = 5.00; // Valor configurable por el cliente

/**
 * [POST /api/savings/process]
 * Orquesta la ejecución del algoritmo de ahorro hormiga en modo Batch (revisión histórica).
 */
export const processSavings = async (req: Request, res: Response): Promise<void> => {
    try {
        const targetAccountId = req.body.accountId || MOCK_CUSTOMER_ACCOUNT_ID;

        const result: SavingsProcessResult = await processHormigaSavings(
            targetAccountId,
            currentSavingsThreshold
        );

        res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error interno desconocido en Batch.';
        res.status(500).json({
            success: false,
            error: errorMessage,
        });
    }
};

/**
 * [PUT /api/savings/threshold]
 * Permite al usuario configurar el umbral de gasto hormiga.
 */
export const setSavingsThreshold = (req: Request, res: Response): void => {
    const { newThreshold } = req.body;

    if (typeof newThreshold !== 'number' || newThreshold <= 0) {
        res.status(400).json({
            success: false,
            message: 'El umbral debe ser un número positivo.'
        });
        return;
    }

    currentSavingsThreshold = newThreshold; // SIMULACIÓN DE ACTUALIZACIÓN

    res.status(200).json({
        success: true,
        message: 'Umbral de ahorro configurado exitosamente.',
        currentThreshold: currentSavingsThreshold.toFixed(2)
    });
};

/**
 * [POST /api/savings/mirror]
 * Simula la detección de una compra en tiempo real y ejecuta el ahorro espejo.
 */
export const mirrorSavings = async (req: Request, res: Response): Promise<void> => {
    // Esperamos el monto de la compra y, opcionalmente, el ID de la cuenta en el cuerpo
    const { purchaseAmount, accountId } = req.body;

    if (typeof purchaseAmount !== 'number' || purchaseAmount <= 0) {
        res.status(400).json({ success: false, message: 'Monto de compra inválido.' });
        return;
    }

    const targetAccountId = accountId || MOCK_CUSTOMER_ACCOUNT_ID;

    try {
        const result = await processMirrorSavings(
            targetAccountId,
            purchaseAmount,
            currentSavingsThreshold
        );

        // Se devuelve un 200 si la operación de validación fue exitosa o si se saltó (SKIP).
        res.status(200).json({ success: true, data: result });

    } catch (error) {
        // Manejo de errores de conexión o transferencia fallida
        const errorMessage = error instanceof Error ? error.message : 'Error interno desconocido en Mirror.';
        res.status(500).json({ success: false, error: errorMessage });
    }
};