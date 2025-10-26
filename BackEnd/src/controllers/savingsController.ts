// src/controllers/savingsController.ts

import type { Request, Response } from 'express';
// Importamos ambos algoritmos (valores ejecutables)
import { processHormigaSavings, processMirrorSavings } from '../services/SavingsAlgorithm.js';
import type { SavingsProcessResult } from '../types/nessie.js';

// Importamos el modelo de Mongoose (valor ejecutable) y la interfaz (solo tipo)
import CustomerModel from '../models/Customer.js';
import type { ICustomer } from '../models/Customer.js';

// MOCK: ID de Cuenta simulada para el MVP si no se envía en el cuerpo de la petición
const MOCK_CUSTOMER_ACCOUNT_ID = '66778899aabbccddeeff0011';

/**
 * Función auxiliar para obtener el ID de cuenta de la petición.
 * En un entorno real, esto vendría de un token de autenticación.
 */
const getTargetAccountId = (req: Request): string => {
    // Intenta obtener el ID del cuerpo, si no usa el MOCK
    return req.body.accountId || MOCK_CUSTOMER_ACCOUNT_ID;
};

/**
 * [POST /api/savings/process] (BATCH)
 * Ejecuta el algoritmo de revisión histórica de gastos hormiga.
 */
export const processSavings = async (req: Request, res: Response): Promise<void> => {

    try {
        const targetAccountId = getTargetAccountId(req);

        // El algoritmo se encarga de obtener el umbral de la DB internamente
        const result: SavingsProcessResult = await processHormigaSavings(targetAccountId);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error interno desconocido en Batch.';
        res.status(500).json({ success: false, error: errorMessage });
    }
};

/**
 * [PUT /api/savings/threshold] (CONFIGURACIÓN)
 * Actualiza el umbral de gasto hormiga en la base de datos.
 */
export const setSavingsThreshold = async (req: Request, res: Response): Promise<void> => {
    console.log('SET THRESHOLD body:', req.body);
    const { newThreshold } = req.body;
    const customerId = getTargetAccountId(req); // Obtenemos el ID del cliente

    if (typeof newThreshold !== 'number' || newThreshold <= 0) {
        res.status(400).json({
            success: false,
            message: 'El umbral debe ser un número positivo.'
        });
        return;
    }

    try {
        // Busca al cliente por su ID de Nessie y actualiza/crea el umbral
        const updatedCustomer: ICustomer | null = await CustomerModel.findOneAndUpdate(
            { nessieCustomerId: customerId },
            { savingsThreshold: newThreshold },
            { new: true, upsert: true } // 'upsert: true' crea el documento si no existe
        );

        // Si se actualizó correctamente, devolvemos el nuevo umbral
        if (updatedCustomer) {
            res.status(200).json({
                success: true,
                message: 'Umbral de ahorro configurado exitosamente.',
                currentThreshold: updatedCustomer.savingsThreshold.toFixed(2)
            });
        } else {
            // Esto solo ocurriría en un caso de error extremo de DB
            res.status(500).json({ success: false, message: 'Fallo al obtener el documento actualizado de la base de datos.' });
        }

    } catch (error) {
        console.error('Error al guardar el umbral en DB:', error);
        res.status(500).json({ success: false, message: 'Fallo la actualización de la base de datos.' });
    }
};

/**
 * [POST /api/savings/mirror] (TIEMPO REAL)
 * Simula una compra inmediata, valida el saldo y ejecuta el ahorro espejo.
 */
export const mirrorSavings = async (req: Request, res: Response): Promise<void> => {
    console.log('MIRROR body:', req.body);
    const { purchaseAmount } = req.body;
    const targetAccountId = getTargetAccountId(req); // Obtenemos el ID del cliente

    if (typeof purchaseAmount !== 'number' || purchaseAmount <= 0) {
        res.status(400).json({ success: false, message: 'Monto de compra inválido.' });
        return;
    }

    try {
        // El algoritmo obtiene el umbral de la DB internamente
        const result: SavingsProcessResult = await processMirrorSavings(
            targetAccountId,
            purchaseAmount
        );

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error interno desconocido en Mirror.';
        res.status(500).json({ success: false, error: errorMessage });
    }
};

export const getSavings = async (req: Request, res: Response): Promise<void> => {
    try {
        // Respuesta mínima para verificar conexión; luego puedes reemplazar por consulta a DB
        res.status(200).json({
            success: true,
            data: {
                totalSavings: 0,
                normalBalance: 10000,
                threshold: 50
            }
        });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Error interno';
        res.status(500).json({ success: false, error: msg });
    }
};