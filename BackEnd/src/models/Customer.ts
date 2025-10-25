// src/models/Customer.ts
import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para TypeScript
export interface ICustomer extends Document {
    nessieCustomerId: string; // El ID que Nessie usa para la cuenta
    savingsThreshold: number; // El umbral de gasto hormiga ($5.00, etc.)
    isActive: boolean;        // Si la función de ahorro está activa
}

// Esquema de Mongoose
const CustomerSchema: Schema = new Schema({
    nessieCustomerId: { type: String, required: true, unique: true },
    savingsThreshold: { type: Number, required: true, default: 5.00 },
    isActive: { type: Boolean, required: true, default: true },
});

// Exporta el modelo
export default mongoose.model<ICustomer>('Customer', CustomerSchema);