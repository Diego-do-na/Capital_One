import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    nessieCustomerId: { type: String, required: true, index: true },

    monto: { type: Number, required: true },
    categoria: { type: String, required: true },
    establecimiento: { type: String, required: true },
    fecha: { type: Date, default: Date.now },

    isHormiga: { type: Boolean, required: true },
    transferAmount: { type: Number, required: true },
    validation: { type: String, required: true }, 
    message: { type: String, required: true },
});

const Transaction = mongoose.model('Transaction', TransactionSchema);
export default Transaction;