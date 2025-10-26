import { processHormigaSavings, processMirrorSavings } from '../services/SavingsAlgorithm.js';
import CustomerModel from '../models/Customer.js';
const MOCK_CUSTOMER_ACCOUNT_ID = '66778899aabbccddeeff0011';
const getTargetAccountId = (req) => {
    return req.body.accountId || MOCK_CUSTOMER_ACCOUNT_ID;
};

export const processSavings = async (req, res) => {
    try {
        const targetAccountId = getTargetAccountId(req);
        const result = await processHormigaSavings(targetAccountId);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error interno desconocido en Batch.';
        res.status(500).json({ success: false, error: errorMessage });
    }
};

export const setSavingsThreshold = async (req, res) => {
    const { newThreshold } = req.body;
    const customerId = getTargetAccountId(req);
    if (typeof newThreshold !== 'number' || newThreshold <= 0) {
        res.status(400).json({
            success: false,
            message: 'El umbral debe ser un número positivo.'
        });
        return;
    }
    try {
        const updatedCustomer = await CustomerModel.findOneAndUpdate({ nessieCustomerId: customerId }, { savingsThreshold: newThreshold }, { new: true, upsert: true } // 'upsert: true' crea el documento si no existe
        );
        if (updatedCustomer) {
            res.status(200).json({
                success: true,
                message: 'Umbral de ahorro configurado exitosamente.',
                currentThreshold: updatedCustomer.savingsThreshold.toFixed(2)
            });
        }
        else {
            res.status(500).json({ success: false, message: 'Fallo al obtener el documento actualizado de la base de datos.' });
        }
    }
    catch (error) {
        console.error('Error al guardar el umbral en DB:', error);
        res.status(500).json({ success: false, message: 'Fallo la actualización de la base de datos.' });
    }
};

export const mirrorSavings = async (req, res) => {
    const { purchaseAmount } = req.body;
    const targetAccountId = getTargetAccountId(req); // Obtenemos el ID del cliente
    if (typeof purchaseAmount !== 'number' || purchaseAmount <= 0) {
        res.status(400).json({ success: false, message: 'Monto de compra inválido.' });
        return;
    }
    try {
        // El algoritmo obtiene el umbral de la DB internamente
        const result = await processMirrorSavings(targetAccountId, purchaseAmount);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error interno desconocido en Mirror.';
        res.status(500).json({ success: false, error: errorMessage });
    }
};
