import axios from 'axios';
import { createTransfer } from './NessieService.js';
import type { SavingsProcessResult } from '../types/nessie.js';
import CustomerModel, { type ICustomer } from '../models/Customer.js';

const ML_SERVICE_URL = 'http://localhost:8000/predict';
const MOCK_INVESTMENT_ACCOUNT_ID = '68fd2f9b9683f20dd51a476b';
const DEFAULT_THRESHOLD = 5.00; 

async function classifyGastoML(purchaseAmount: number, categoria: string, establecimiento: string): Promise<boolean> {
    console.log(`ML CLIENT: Enviando datos a ${ML_SERVICE_URL}...`);
    try {
        const response = await axios.post(ML_SERVICE_URL, {
            precio: purchaseAmount,
            categoria: categoria,
            tienda: establecimiento
        });
        return response.data?.is_hormiga === 1;
    } catch (error) {
        console.error("❌ FALLO DE CONEXIÓN CON SERVICIO ML (PYTHON). Usando lógica de contingencia.");
        if (purchaseAmount > 0 && purchaseAmount <= DEFAULT_THRESHOLD) {
            console.warn("ML FALLBACK: Usando lógica simple (<= $5.00) como contingencia.");
            return true;
        }
        return false;
    }
}

async function getCustomerConfig(accountId: string): Promise<ICustomer> {
    let config = await CustomerModel.findOne({ nessieCustomerId: accountId });
    if (!config) {
        config = new CustomerModel({
            nessieCustomerId: accountId,
            saldoNormal: 10000.00,
            ahorroTotal: 0.00,
        });
        await config.save();
    }
    return config as ICustomer;
}

export async function processMirrorSavings(
    customerAccountId: string,
    purchaseAmount: number,
    categoria: string,
    establecimiento: string
): Promise<SavingsProcessResult> {

    const amountToMirror = purchaseAmount;
    const customer = await getCustomerConfig(customerAccountId);
    const currentBalance = customer.saldoNormal;

    const isHormigaML = await classifyGastoML(amountToMirror, categoria, establecimiento);

    let requiredCost = purchaseAmount;
    if (isHormigaML) {
        requiredCost = purchaseAmount + amountToMirror;
    }

    if (!isHormigaML) {
        if (currentBalance < purchaseAmount) {
            return {
                message: `Transacción rechazada. Saldo insuficiente ($${currentBalance.toFixed(2)}) para cubrir el gasto normal de $${purchaseAmount.toFixed(2)}.`,
                transferredAmount: 0,
                validation: 'FAILED_BALANCE',
            } as SavingsProcessResult;
        }
        return {
            message: `Gasto de $${amountToMirror.toFixed(2)} clasificado como NO hormiga (Gasto Normal).`,
            transferredAmount: 0,
            validation: 'SKIP',
        } as SavingsProcessResult;
    }

    if (currentBalance >= requiredCost) {
        try {
            await createTransfer(customerAccountId, MOCK_INVESTMENT_ACCOUNT_ID, amountToMirror);

            return {
                message: `Ahorro espejo aprobado por ML. Costo total: $${requiredCost.toFixed(2)}. (Gasto Hormiga)`,
                transferredAmount: amountToMirror.toFixed(2),
                validation: 'SUCCESS',
            } as SavingsProcessResult;
        } catch (error) {
            throw new Error('Error al ejecutar la transferencia, pero el saldo era suficiente.');
        }

    } else if (currentBalance >= purchaseAmount) {
        console.warn(`Fondos insuficientes para el espejo. Compra de $${purchaseAmount} permitida.`);
        return {
            message: `¡Alerta! Compra de $${purchaseAmount.toFixed(2)} aprobada, pero sin fondos suficientes para el ahorro espejo.`,
            transferredAmount: 0,
            validation: 'FAILED_MIRROR',
        } as SavingsProcessResult;

    } else {
        return {
            message: `Transacción rechazada. Saldo insuficiente ($${currentBalance.toFixed(2)}) para cubrir el gasto hormiga de $${purchaseAmount.toFixed(2)}.`,
            transferredAmount: 0,
            validation: 'FAILED_BALANCE',
        } as SavingsProcessResult;
    }
}