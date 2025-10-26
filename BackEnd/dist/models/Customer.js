import mongoose, { Schema, Document } from 'mongoose';

const CustomerSchema = new Schema({
    nessieCustomerId: { type: String, required: true, unique: true },
    savingsThreshold: { type: Number, required: true, default: 5.00 },
    isActive: { type: Boolean, required: true, default: true },
});

export default mongoose.model('Customer', CustomerSchema);
