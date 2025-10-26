<<<<<<< HEAD
// src/services/SavingsAlgorithm.ts

import { createTransfer, getAccountDetails } from './NessieService.js';
import type { SavingsProcessResult } from '../types/nessie.js';
=======
import { getRecentPurchases, createTransfer, getAccountDetails } from './NessieService.js';
import type { Purchase, SavingsProcessResult } from '../types/nessie.js';
import CustomerModel, { type ICustomer } from '../models/Customer.js';
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef

const MOCK_INVESTMENT_ACCOUNT_ID = '68fd2f9b9683f20dd51a476b';

/**
 * FUNCIÓN ML SIMULADA: En la vida real, aquí harías una petición HTTP a tu servidor Python (p.ej., http://localhost:8000/predict).
 */
<<<<<<< HEAD
async function classifyGastoML(purchaseAmount: number, categoria: string, establecimiento: string): Promise<boolean> {
    console.log(`ML MOCK: Clasificando $${purchaseAmount} (${categoria}, ${establecimiento})...`);

    // 🚨 Lógica de Clasificación ML MOCK:
    // Simula que el modelo clasifica gastos pequeños en categorías comunes como hormiga.
    if (purchaseAmount > 0 && purchaseAmount <= 5.00) {
        // En el mock, clasificaremos cualquier gasto menor a 5.00 como hormiga
        return Promise.resolve(true);
    }

    return Promise.resolve(false);
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
    // src/services/SavingsAlgorithm.ts (Dentro de processMirrorSavings)

// ...

// 1. CLASIFICACIÓN DE MACHINE LEARNING
    try {
        const isHormigaML = await classifyGastoML(amountToMirror, categoria, establecimiento);
        // ...
    } catch (e) {
        // Si la función classifyGastoML lanza un error (por ejemplo, TypeError),
        // esta excepción es atrapada y la función processMirrorSavings falla.
        console.error("Error en la clasificación ML:", e);
        throw new Error("Fallo en el servicio de clasificación de gastos."); // Lanza un error genérico
    }

    /**if (!isHormigaML) {
        return {
            message: `Gasto de $${amountToMirror.toFixed(2)} clasificado como NO hormiga por el modelo ML.`,
            transferredAmount: 0,
            validation: 'SKIP',
        } as SavingsProcessResult;
    }*/

    // 2. Obtener Saldo Actual y Validar Fondos
=======
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

>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
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

<<<<<<< HEAD
    // 3. Ejecutar la Transferencia Espejo
=======
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
    try {
        const transferResult = await createTransfer(
            customerAccountId,
            MOCK_INVESTMENT_ACCOUNT_ID,
            amountToMirror
        );

        return {
            message: `Ahorro espejo aprobado por ML. Transferencia de $${amountToMirror.toFixed(2)} ejecutada.`,
            transferredAmount: amountToMirror.toFixed(2),
            validation: 'SUCCESS',
            transferId: transferResult._id,
        } as SavingsProcessResult;
    } catch (error) {
        console.error('Fallo la transferencia del ahorro espejo:', error);
        throw new Error('Error al ejecutar la transferencia del ahorro espejo.');
    }
}