import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    purchaseAmount: Number,
    savingsAmount: Number,
    establishment: { type: String, default: 'No establishment'},
    category: {type: String, default: 'No category'}
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
