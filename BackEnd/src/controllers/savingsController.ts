import type { Request, Response } from 'express';
import { processMirrorSavings } from '../services/SavingsAlgorithm.js';
import type { SavingsProcessResult } from '../types/nessie.js';
import CustomerModel from '../models/Customer.js';

const MOCK_CUSTOMER_ACCOUNT_ID = 'TEST_HACKATHON_USER';

const getTargetAccountId = (req: Request): string => {
    return req.params.accountId || req.body.accountId || MOCK_CUSTOMER_ACCOUNT_ID;
};


export const getCustomerStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerId = getTargetAccountId(req);
        const customer = await CustomerModel.findOne({ nessieCustomerId: customerId });

        if (!customer) {
            res.status(200).json({
                success: true,
                saldoNormal: 10000.00,
                ahorroTotal: 0.00,
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

export const mirrorSavings = async (req: Request, res: Response): Promise<void> => {
    const { purchaseAmount, categoria, establecimiento } = req.body;
    const targetAccountId = getTargetAccountId(req);

    if (typeof purchaseAmount !== 'number' || purchaseAmount <= 0) {
        res.status(400).json({ success: false, message: 'Monto de compra inválido.' });
        return;
    }

    try {
        const result: SavingsProcessResult = await processMirrorSavings(
            targetAccountId,
            purchaseAmount,
            categoria,
            establecimiento
        );

        let amountToTransfer = 0;
        let amountToDiscount = 0;

        const validationStatus = result.validation;

        if (validationStatus === 'SUCCESS') {
            amountToTransfer = parseFloat(result.transferredAmount as string);
            amountToDiscount = purchaseAmount + amountToTransfer;

        } else if (validationStatus === 'SKIP' || validationStatus === 'FAILED_MIRROR') {
            amountToDiscount = purchaseAmount;
        } else if (validationStatus === 'FAILED_BALANCE') {
        }

        if (validationStatus !== 'FAILED_BALANCE') {
            await CustomerModel.findOneAndUpdate(
                { nessieCustomerId: targetAccountId },
                {
                    $inc: {
                        saldoNormal: -amountToDiscount,
                        ahorroTotal: amountToTransfer
                    }
                }
            );
        }

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error interno desconocido en Mirror.';
        res.status(500).json({ success: false, error: errorMessage });
    }
};