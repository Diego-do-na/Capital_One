// src/types/nessie.ts

// Tipos base para respuestas de Nessie (simplificado)
export interface Purchase {
    _id: string;
    type: 'purchase';
    purchase_date: string; // Formato ISO 8601 (ej: "2025-10-25")
    amount: number;
    description: string;
    status: string;
    merchant_id: string;
    account_id: string;
}

export interface Transfer {
    _id: string;
    type: 'transfer';
    transaction_date: string;
    amount: number;
    description: string;
    status: string;
    payer_id: string;
    payee_id: string;
}

// ⬅️ INTERFAZ AÑADIDA
export interface Account {
    _id: string;
    type: string;
    nickname: string;
    rewards: number;
    balance: number; // EL CAMPO CLAVE PARA LA VALIDACIÓN DE SALDO
    customer_id: string;
}

// Interfaz para la respuesta del controlador
export interface SavingsProcessResult {
    message: string;
    transferredAmount: string | number;
    purchasesCount: number;
    transferId?: string;
    validation?: 'SUCCESS' | 'FAILED_BALANCE' | 'SKIP'; // AÑADIDO para el nuevo algoritmo
}