import express from 'express';
import type { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import connectDB from './config/db.js';
import savingsRoutes from './routes/savingsRoutes.js';
import cors from 'cors';
import transactionRoutes from './routes/transactionRoutes.js';


dotenv.config();

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/transactions', transactionRoutes);

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Servidor Ahorro Hormiga funcionando!');
});

app.use('/api/savings', savingsRoutes);

const startServer = async () => {
    try {
        console.log('Variables de entorno cargadas. Intentando conectar a DB...');

        await connectDB();

        app.listen(PORT, () => {
            console.log(`⚡️ Servidor corriendo en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ FALLO CRÍTICO AL INICIAR EL SERVIDOR O CONECTAR A DB:', error);
        process.exit(1);
    }
};

startServer(); 