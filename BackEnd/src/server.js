// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import savingsRoutes from './routes/savingsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Ruta de Salud
app.get('/', (req, res) => {
    res.status(200).send('Servidor Ahorro Hormiga funcionando!');
});

// Rutas del proyecto
app.use('/api/savings', savingsRoutes);

app.listen(PORT, () => {
    console.log(`⚡️ Servidor corriendo en http://localhost:${PORT}`);
});