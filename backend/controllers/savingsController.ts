// src/controllers/savingsController.ts
import { Request, Response } from 'express';
import { processHormigaSavings } from '../services/SavingsAlgorithm';
import { SavingsProcessResult } from '../types/nessie';

// SIMULACIÓN: En un proyecto real, esta información vendría del cuerpo de la petición (req.body)
// o de una base de datos de sesión/usuario.
const MOCK_CUSTOMER_ACCOUNT_ID = '66778899aabbccddeeff0011';
let currentSavingsThreshold = 5.00; // SIMULACIÓN: Umbral por defecto

/**
 * [POST /api/savings/process]
 * Orquesta la ejecución del algoritmo de ahorro hormiga.
 */
export const processSavings = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log(`Iniciando proceso de ahorro hormiga para cuenta: ${MOCK_CUSTOMER_ACCOUNT_ID}`);
        console.log(`Umbral actual: $${currentSavingsThreshold.toFixed(2)}`);

        // Llama a la lógica de negocio principal
        const result: SavingsProcessResult = await processHormigaSavings(
            MOCK_CUSTOMER_ACCOUNT_ID,
            currentSavingsThreshold
        );

        // Responde al cliente (frontend)
        res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        // Manejo de errores de la API Nessie o del servidor
        const errorMessage = error instanceof Error ? error.message : 'Error interno desconocido.';
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
    // Idealmente, aquí se actualizaría la base de datos (DB)
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