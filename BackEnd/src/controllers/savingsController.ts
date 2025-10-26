import type { Request, Response } from 'express';
import { processHormigaSavings, processMirrorSavings } from '../services/SavingsAlgorithm.js';
import type { SavingsProcessResult } from '../types/nessie.js';
import CustomerModel from '../models/Customer.js';
import type { ICustomer } from '../models/Customer.js';

// MOCK: ID de Cuenta simulada para el MVP si no se envía en el cuerpo de la petición
const MOCK_CUSTOMER_ACCOUNT_ID = 'genarinh0';

const getTargetAccountId = (req: Request): string => {
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
                message: 'Umbral de ahorro configurado exitosamente.'
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
    const { purchaseAmount, category, establishment } = req.body;
    const targetAccountId = getTargetAccountId(req);

    if (typeof purchaseAmount !== 'number' || purchaseAmount <= 0) {
        res.status(400).json({ success: false, message: 'Invalid Amount.' });
        return;
    }

    try {
        // Buscar o crear el cliente
        let customer = await CustomerModel.findOne({ CustomerId: targetAccountId });
        
        if (!customer) {
            customer = new CustomerModel({
                customerId: targetAccountId,
                savings: 0
            });
        }

        const savingsAmount = purchaseAmount;

        // Actualizar totales
        customer.savings = (customer.savings || 0) + savingsAmount;
        
        // Agregar la transacción
        customer.transaction.push({
            purchaseAmount,
            savingsAmount,
            establishment,
            category
        });

        // Guardar cambios
        await customer.save();

        res.status(200).json({ 
            success: true, 
            data: {
                savedAmount: savingsAmount,
                totalSavings: customer.savings,
                establishment: establishment,
                category: category
            }
        });
    } catch (error) {
        console.error('Error en mirror savings:', error);
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