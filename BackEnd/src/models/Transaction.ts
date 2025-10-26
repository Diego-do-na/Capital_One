import mongoose, { Schema, Document } from 'mongoose';

// Interfaz para TypeScript
export interface ITransaction extends Document {
    nessieCustomerId: string;
    monto: number;
    categoria: string;
    establecimiento: string;
    fecha: Date;
    isHormiga: boolean; // ¿Fue clasificado como gasto hormiga?
    transferAmount: number; // Monto real transferido (0 si no aplica)
    message: string; // Mensaje de éxito/fallo
}

// Esquema de Mongoose
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

// Exporta el modelo
export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
