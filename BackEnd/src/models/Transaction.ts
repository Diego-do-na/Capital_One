// src/models/Transaction.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    nessieCustomerId: string;
    monto: number;
    categoria: string;
    establecimiento: string;
    fecha: Date;
    isHormiga: boolean;
    transferAmount: number;
    message: string;
}

const TransactionSchema: Schema = new Schema({
    nessieCustomerId: { type: String, required: true },
    monto: { type: Number, required: true },
    categoria: { type: String, required: true },
    establecimiento: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    isHormiga: { type: Boolean, required: true },
    transferAmount: { type: Number, default: 0 },
    message: { type: String, default: 'Gasto registrado' },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);