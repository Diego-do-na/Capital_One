import { getRecentPurchases, createTransfer, getAccountDetails } from './NessieService.js';
import type { Purchase, SavingsProcessResult } from '../types/nessie.js';
import CustomerModel, { type ICustomer } from '../models/Customer.js';

const MOCK_INVESTMENT_ACCOUNT_ID = '68fd2f9b9683f20dd51a476b';
const DEFAULT_THRESHOLD = 5.00;

/**
 * Función auxiliar para obtener la configuración del cliente (o crearla con valores por defecto).
 * @param accountId El ID de la cuenta del cliente (Nessie).
 * @returns La configuración del cliente de la DB.
 */
async function getCustomerConfig(accountId: string): Promise<ICustomer> {
    let config = await CustomerModel.findOne({ CustomerId: accountId });

    if (!config) {
        config = new CustomerModel({
            CustomerId: accountId,
            savings: DEFAULT_THRESHOLD
        });
        await config.save();
    }

    return config as ICustomer;
}

export async function processHormigaSavings(
    customerAccountId: string
): Promise<SavingsProcessResult> { 

    // 1. Obtener la configuración del umbral desde la DB
    const customerConfig = await getCustomerConfig(customerAccountId);
    const currentThreshold = customerConfig.savings;

    if (currentThreshold <= 0) {
        return {
            message: 'Umbral de ahorro no configurado o inválido.',
            transferredAmount: 0,
            purchasesCount: 0,
        } as SavingsProcessResult;
    }

    const recentPurchases: Purchase[] = await getRecentPurchases(customerAccountId);

    const hormigaPurchases = recentPurchases.filter(
        (purchase) => purchase.amount > 0 && purchase.amount <= currentThreshold
    );

    if (hormigaPurchases.length === 0) {
        return {
            message: `No se encontraron gastos hormiga bajo el umbral de $${currentThreshold.toFixed(2)}.`,
            transferredAmount: 0,
            purchasesCount: 0,
        } as SavingsProcessResult;
    }

    const totalAmountToTransfer = hormigaPurchases.reduce(
        (sum, purchase) => sum + purchase.amount,
        0
    );

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
        } as SavingsProcessResult;
    } catch (error) {
        console.error('Fallo el proceso de ahorro hormiga (Batch):', error);
        throw new Error('Error al ejecutar la transferencia del ahorro hormiga (Batch).');
    }
}

export async function processMirrorSavings(
    customerAccountId: string,
    purchaseAmount: number
): Promise<SavingsProcessResult> {
    const customerConfig = await getCustomerConfig(customerAccountId);
    const currentThreshold = customerConfig.savings;

    const amountToMirror = purchaseAmount;
    if (amountToMirror <= 0 || amountToMirror > currentThreshold) {
        return {
            message: `La compra de $${amountToMirror.toFixed(2)} no califica como gasto hormiga (Umbral: $${currentThreshold.toFixed(2)}).`,
            transferredAmount: 0,
            validation: 'SKIP',
        } as SavingsProcessResult;
    }

    const accountInfo = await getAccountDetails(customerAccountId);
    const currentBalance = accountInfo.balance;

    if (currentBalance < amountToMirror) {
        console.warn(`Saldo de $${currentBalance} insuficiente para espejo de $${amountToMirror}.`);
        return {
            message: `Saldo insuficiente ($${currentBalance.toFixed(2)}) para el ahorro espejo de $${amountToMirror.toFixed(2)}.`,
            transferredAmount: 0,
            validation: 'FAILED_BALANCE',
        } as SavingsProcessResult;
    }

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
        } as SavingsProcessResult;
    } catch (error) {
        console.error('Fallo la transferencia del ahorro espejo:', error);
        throw new Error('Error al ejecutar la transferencia del ahorro espejo.');
    }
}