import type { Request, Response } from 'express';
<<<<<<< HEAD
import { processMirrorSavings } from '../services/SavingsAlgorithm.js';
=======
import { processHormigaSavings, processMirrorSavings } from '../services/SavingsAlgorithm.js';
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
import type { SavingsProcessResult } from '../types/nessie.js';
import CustomerModel from '../models/Customer.js';

<<<<<<< HEAD
const MOCK_CUSTOMER_ACCOUNT_ID = 'TEST_HACKATHON_USER';

const getTargetAccountId = (req: Request): string => {
    // Fijo para un solo cliente
    return req.params.accountId || req.body.accountId || MOCK_CUSTOMER_ACCOUNT_ID;
};

/**
 * [GET /api/savings/status/:accountId]
 * Obtiene el saldo y ahorro del único cliente para inicializar el frontend.
 */
export const getCustomerStatus = async (req: Request, res: Response): Promise<void> => {
=======
const MOCK_CUSTOMER_ACCOUNT_ID = 'genarinh0';

const getTargetAccountId = (req: Request): string => {
    return req.body.accountId || MOCK_CUSTOMER_ACCOUNT_ID;
};

export const processSavings = async (req: Request, res: Response): Promise<void> => {

>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
    try {
        const customerId = getTargetAccountId(req);
        const customer = await CustomerModel.findOne({ nessieCustomerId: customerId });

<<<<<<< HEAD
        if (!customer) {
            // Si el cliente no existe, lo inicializa con valores por defecto
            res.status(200).json({
                success: true,
                saldoNormal: 10000.00,
                ahorroTotal: 0.00,
=======
        // El algoritmo se encarga de obtener el umbral de la DB internamente
        const result: SavingsProcessResult = await processHormigaSavings(targetAccountId);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error interno desconocido en Batch.';
        res.status(500).json({ success: false, error: errorMessage });
    }
};

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
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
            });
            return;
        }

        res.status(200).json({
            success: true,
            saldoNormal: customer.saldoNormal,
            ahorroTotal: customer.ahorroTotal,
        });

    } catch (error) {
        console.error('Error al obtener el estado del cliente:', error);
        res.status(500).json({ success: false, error: 'Fallo al obtener datos iniciales.' });
    }
};

<<<<<<< HEAD
/**
 * [POST /api/savings/mirror] (Lógica ML)
 */
export const mirrorSavings = async (req: Request, res: Response): Promise<void> => {
    // Recibe los datos completos para el modelo de ML
    const { purchaseAmount, categoria, establecimiento } = req.body;
=======
export const mirrorSavings = async (req: Request, res: Response): Promise<void> => {
    console.log('MIRROR body:', req.body);
    const { purchaseAmount, category, establishment } = req.body;
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
    const targetAccountId = getTargetAccountId(req);

    if (typeof purchaseAmount !== 'number' || purchaseAmount <= 0) {
        res.status(400).json({ success: false, message: 'Invalid Amount.' });
        return;
    }

    try {
<<<<<<< HEAD
        const result: SavingsProcessResult = await processMirrorSavings(
            targetAccountId,
            purchaseAmount,
            categoria,
            establecimiento
        );

        if (result.validation === 'SUCCESS') {
            const amountToTransfer = parseFloat(result.transferredAmount as string);

            // Actualiza los balances del cliente ÚNICO en MongoDB
            await CustomerModel.findOneAndUpdate(
                { nessieCustomerId: targetAccountId },
                {
                    $inc: {
                        saldoNormal: -purchaseAmount,
                        ahorroTotal: amountToTransfer
                    }
                }
            );
        }

        res.status(200).json({ success: true, data: result });
=======
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
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
    } catch (error) {
        console.error('Error en mirror savings:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error interno desconocido en Mirror.';
        res.status(500).json({ success: false, error: errorMessage });
    }
};
<<<<<<< HEAD
// NOTA: Las rutas de setThreshold y processSavings fueron eliminadas.
=======

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
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
