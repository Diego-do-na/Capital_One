<<<<<<< HEAD
// src/models/Customer.ts

import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para TypeScript
export interface ICustomer extends Document {
    nessieCustomerId: string;
    saldoNormal: number;    // Saldo simulado
    ahorroTotal: number;    // Monto total acumulado
}

// Esquema de Mongoose
const CustomerSchema: Schema = new Schema({
    nessieCustomerId: { type: String, required: true, unique: true },
    isActive: { type: Boolean, required: true, default: true },
    saldoNormal: { type: Number, default: 10000.00 },
    ahorroTotal: { type: Number, default: 0.00 },
=======
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    purchaseAmount: Number,
    savingsAmount: Number,
    establishment: { type: String, default: 'No establishment'},
    category: {type: String, default: 'No category'}
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
});

const customerSchema = new mongoose.Schema({
    customerId: { type: String, required: true, unique: true },
    savings: { type: Number, default: 0 },
    transaction: [transactionSchema]
    }
);

export interface ICustomer extends mongoose.Document {
    customerId: string;
    savings: number;
    transaction: Array<{
        purchaseAmount: number;
        savingsAmount: number;
        establishment: string;
        category: string;
        }>;
}

const CustomerModel = mongoose.model<ICustomer>('Customer', customerSchema);
export default CustomerModel;
