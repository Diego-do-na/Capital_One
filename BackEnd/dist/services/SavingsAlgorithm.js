import { getRecentPurchases, createTransfer, getAccountDetails } from './NessieService.js';
import CustomerModel, {} from '../models/Customer.js';

const MOCK_INVESTMENT_ACCOUNT_ID = '68fd2f9b9683f20dd51a476b';
const DEFAULT_THRESHOLD = 5.00;
async function getCustomerConfig(accountId) {
    let config = await CustomerModel.findOne({ nessieCustomerId: accountId });
    if (!config) {
        config = new CustomerModel({
            nessieCustomerId: accountId,
            savingsThreshold: DEFAULT_THRESHOLD
        });
        await config.save();
    }
    return config;
}
export async function processHormigaSavings(customerAccountId) {
    const customerConfig = await getCustomerConfig(customerAccountId);
    const currentThreshold = customerConfig.savingsThreshold;
    if (currentThreshold <= 0) {
        return {
            message: 'Umbral de ahorro no configurado o inválido.',
            transferredAmount: 0,
            purchasesCount: 0,
        };
    }
    const recentPurchases = await getRecentPurchases(customerAccountId);
    const hormigaPurchases = recentPurchases.filter((purchase) => purchase.amount > 0 && purchase.amount <= currentThreshold);
    if (hormigaPurchases.length === 0) {
        return {
            message: `No se encontraron gastos hormiga bajo el umbral de $${currentThreshold.toFixed(2)}.`,
            transferredAmount: 0,
            purchasesCount: 0,
        };
    }
    const totalAmountToTransfer = hormigaPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
    try {
        const transferResult = await createTransfer(customerAccountId, MOCK_INVESTMENT_ACCOUNT_ID, totalAmountToTransfer);
        return {
            message: 'Ahorro Hormiga (Batch) procesado exitosamente.',
            transferredAmount: totalAmountToTransfer.toFixed(2),
            purchasesCount: hormigaPurchases.length,
            transferId: transferResult._id,
        }; 
    }
    catch (error) {
        console.error('Fallo el proceso de ahorro hormiga (Batch):', error);
        throw new Error('Error al ejecutar la transferencia del ahorro hormiga (Batch).');
    }
}
export async function processMirrorSavings(customerAccountId, purchaseAmount) {
    const customerConfig = await getCustomerConfig(customerAccountId);
    const currentThreshold = customerConfig.savingsThreshold;
    const amountToMirror = purchaseAmount;

    if (amountToMirror <= 0 || amountToMirror > currentThreshold) {
        return {
            message: `La compra de $${amountToMirror.toFixed(2)} no califica como gasto hormiga (Umbral: $${currentThreshold.toFixed(2)}).`,
            transferredAmount: 0,
            validation: 'SKIP',
        }; 
    }

    const accountInfo = await getAccountDetails(customerAccountId);
    const currentBalance = accountInfo.balance;
    if (currentBalance < amountToMirror) {
        console.warn(`Saldo de $${currentBalance} insuficiente para espejo de $${amountToMirror}.`);
        return {
            message: `Saldo insuficiente ($${currentBalance.toFixed(2)}) para el ahorro espejo de $${amountToMirror.toFixed(2)}.`,
            transferredAmount: 0,
            validation: 'FAILED_BALANCE', 
        }; 
    }
    try {
        const transferResult = await createTransfer(customerAccountId, MOCK_INVESTMENT_ACCOUNT_ID, amountToMirror);
        return {
            message: 'Ahorro espejo procesado exitosamente.',
            transferredAmount: amountToMirror.toFixed(2),
            validation: 'SUCCESS', 
            transferId: transferResult._id,
        };
    }
    catch (error) {
        console.error('Fallo la transferencia del ahorro espejo:', error);
        throw new Error('Error al ejecutar la transferencia del ahorro espejo.');
    }
}
