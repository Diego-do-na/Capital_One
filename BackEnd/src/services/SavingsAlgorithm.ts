// src/services/SavingsAlgorithm.ts

import axios from 'axios'; // Necesario para llamar al servicio de ML en Python
import { createTransfer } from './NessieService.js';
import type { SavingsProcessResult } from '../types/nessie.js';
import CustomerModel, { type ICustomer } from '../models/Customer.js';

// URL de tu servicio de Machine Learning (Python/FastAPI)
const ML_SERVICE_URL = 'http://localhost:8000/predict';
const MOCK_INVESTMENT_ACCOUNT_ID = '68fd2f9b9683f20dd51a476b';
const DEFAULT_THRESHOLD = 5.00; // Usado solo como fallback de contingencia

/**
 * FUNCIÓN ML REAL: Hace una petición HTTP al servidor de Python/FastAPI.
 * @returns true (1) si es gasto hormiga, false (0) si no lo es.
 */
async function classifyGastoML(purchaseAmount: number, categoria: string, establecimiento: string): Promise<boolean> {

    console.log(`ML CLIENT: Enviando datos a ${ML_SERVICE_URL}...`);

    try {
        const response = await axios.post(ML_SERVICE_URL, {
            precio: purchaseAmount, // Nombre de la variable que espera Python
            categoria: categoria,
            tienda: establecimiento
        });

        const isHormiga = response.data?.is_hormiga === 1;

        console.log(`ML CLIENT: Respuesta recibida: ${isHormiga ? 'Hormiga (1)' : 'Normal (0)'}`);

        return isHormiga;

    } catch (error) {
        // ❌ FALLBACK DE CONTINGENCIA: Si el servidor Python no responde (404, 500, etc.)
        console.error("❌ FALLO DE CONEXIÓN CON SERVICIO ML (PYTHON). Usando lógica de contingencia.");

        // Usamos una lógica simple de fallback (monto <= $5.00)
        if (purchaseAmount > 0 && purchaseAmount <= DEFAULT_THRESHOLD) {
            console.warn("ML FALLBACK: Usando lógica simple (<= $5.00) como contingencia.");
            return true;
        }
        return false;
    }
}

/**
 * Función auxiliar para obtener la configuración del cliente (Persistencia en DB).
 */
async function getCustomerConfig(accountId: string): Promise<ICustomer> {
    let config = await CustomerModel.findOne({ nessieCustomerId: accountId });

    if (!config) {
        // Crea el documento si el cliente único no existe
        config = new CustomerModel({
            nessieCustomerId: accountId,
            saldoNormal: 10000.00,
            ahorroTotal: 0.00,
        });
        await config.save();
    }

    return config as ICustomer;
}

// ... (processHormigaSavings omitido) ...

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

    if (!isHormigaML) {
        return {
            message: `Gasto de $${amountToMirror.toFixed(2)} clasificado como NO hormiga por el modelo ML.`,
            transferredAmount: 0,
            validation: 'SKIP',
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

    // 3. Ejecutar la Transferencia Espejo (MOCK)
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