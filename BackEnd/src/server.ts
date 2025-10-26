import express from 'express';
import type { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import connectDB from './config/db.js';
import savingsRoutes from './routes/savingsRoutes.js';
import cors from 'cors';

dotenv.config();

console.log('Variables de entorno cargadas. Verificando MONGO_URI...');
console.log('URI:', process.env.MONGO_URI ? 'Cargada' : 'No cargada');

connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Servidor Ahorro Hormiga funcionando!');
});

app.use('/api/savings', savingsRoutes);

app.listen(PORT, () => {
    console.log(`⚡️ Servidor corriendo en http://localhost:${PORT}`);
});