import type { Request, Response } from 'express';
import TransactionModel from '../models/Transaction.js';

// MOCK: ID de Cuenta simulada para el MVP
const MOCK_CUSTOMER_ACCOUNT_ID = 'TEST_HACKATHON_USER';
const getTargetAccountId = (req: Request): string => {
    return req.params.accountId || req.body.accountId || MOCK_CUSTOMER_ACCOUNT_ID;
};

/**
 * [POST /api/transactions]
 * Agrega una nueva transacción al historial (llamado por el cliente después del gasto).
 */
export const addTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        // Los datos vienen del frontend después de que el usuario hace clic en guardar
        const { monto, categoria, establecimiento, isHormiga, transferAmount, message } = req.body;
        const nessieCustomerId = getTargetAccountId(req);

        const newTransaction = new TransactionModel({
            nessieCustomerId,
            monto,
            categoria,
            establecimiento,
            isHormiga: isHormiga || false, // Asumir false si no se especifica
            transferAmount: transferAmount || 0,
            message: message || 'Gasto registrado',
        });

        await newTransaction.save();

        res.status(201).json({ success: true, message: 'Transacción guardada.', transaction: newTransaction });
    } catch (error) {
        console.error('Error al guardar la transacción:', error);
        res.status(500).json({ success: false, error: 'Fallo al guardar la transacción en la DB.' });
    }
};

/**
 * [GET /api/transactions/:accountId]
 * Obtiene el historial de transacciones de un cliente (para mostrar en el frontend).
 */
export const getTransactionsHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const nessieCustomerId = getTargetAccountId(req);

        // Obtenemos las últimas 50 transacciones, ordenadas por fecha descendente
        const history = await TransactionModel.find({ nessieCustomerId })
            .sort({ fecha: -1 })
            .limit(50);

        res.status(200).json({ success: true, history });
    } catch (error) {
        console.error('Error al obtener el historial:', error);
        res.status(500).json({ success: false, error: 'Fallo al obtener el historial de la DB.' });
    }
};
