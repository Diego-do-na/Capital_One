// src/services/SavingsAlgorithm.ts

import axios from 'axios'; // Necesario para llamar al servicio de ML en Python
import { createTransfer } from './NessieService.js';
import type { SavingsProcessResult } from '../types/nessie.js';
import CustomerModel, { type ICustomer } from '../models/Customer.js';

const ML_SERVICE_URL = 'http://localhost:8000/predict';
const MOCK_INVESTMENT_ACCOUNT_ID = '68fd2f9b9683f20dd51a476b';
const DEFAULT_THRESHOLD = 5.00;

// ... (Función classifyGastoML - Sin cambios, ya que llama a tu API Python) ...

async function classifyGastoML(purchaseAmount: number, categoria: string, establecimiento: string): Promise<boolean> {

    console.log(`ML CLIENT: Enviando datos a ${ML_SERVICE_URL}...`);

    try {
        const response = await axios.post(ML_SERVICE_URL, {
            precio: purchaseAmount,
            categoria: categoria,
            tienda: establecimiento
        });

        const isHormiga = response.data?.is_hormiga === 1;

        console.log(`ML CLIENT: Respuesta recibida: ${isHormiga ? 'Hormiga (1)' : 'Normal (0)'}`);

        return isHormiga;

    } catch (error) {
        console.error("❌ FALLO DE CONEXIÓN CON SERVICIO ML (PYTHON). Usando lógica de contingencia.");

        if (purchaseAmount > 0 && purchaseAmount <= DEFAULT_THRESHOLD) {
            console.warn("ML FALLBACK: Usando lógica simple (<= $5.00) como contingencia.");
            return true;
        }
        return false;
    }
}

// ... (Función getCustomerConfig) ...

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


/**
 * ALGORITMO TIEMPO REAL (ESPEJO) - Impulsado por ML
 */
export async function processMirrorSavings(
    customerAccountId: string,
    purchaseAmount: number,
    categoria: string,
    establecimiento: string
): Promise<SavingsProcessResult> {

    const amountToMirror = purchaseAmount;

    // 1. CLASIFICACIÓN DE MACHINE LEARNING
    const isHormigaML = await classifyGastoML(amountToMirror, categoria, establecimiento);

    // ⬅️ LÓGICA DE GASTO NORMAL (validation: SKIP)
    if (!isHormigaML) {
        return {
            message: `Gasto de $${amountToMirror.toFixed(2)} clasificado como NO hormiga por el modelo ML (Gasto Normal).`,
            transferredAmount: 0,
            validation: 'SKIP', // Indica al controlador que solo debe descontar el gasto base
        } as SavingsProcessResult;
    }

    // 2. OBTENER SALDO DEL MÓDULO PERSISTENTE (MongoDB)
    const customer = await getCustomerConfig(customerAccountId);
    const currentBalance = customer.saldoNormal;

    if (currentBalance < amountToMirror) {
        console.warn(`Saldo de $${currentBalance} insuficiente para espejo de $${amountToMirror}.`);
        return {
            message: `Saldo insuficiente ($${currentBalance.toFixed(2)}) para el ahorro espejo de $${amountToMirror.toFixed(2)}.`,
            transferredAmount: 0,
            validation: 'FAILED_BALANCE',
        } as SavingsProcessResult;
    }

    // 3. Ejecutar la Transferencia Espejo (MOCK) - Solo si pasa la validación
    try {
        const transferResult = await createTransfer(
            customerAccountId,
            MOCK_INVESTMENT_ACCOUNT_ID,
            amountToMirror
        );

        return {
            message: `Ahorro espejo aprobado por ML. Transferencia de $${amountToMirror.toFixed(2)} ejecutada. (Gasto Hormiga)`,
            transferredAmount: amountToMirror.toFixed(2),
            validation: 'SUCCESS',
            transferId: transferResult._id,
        } as SavingsProcessResult;
    } catch (error) {
        console.error('Fallo la transferencia del ahorro espejo:', error);
        throw new Error('Error al ejecutar la transferencia del ahorro espejo.');
    }
}