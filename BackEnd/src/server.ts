<<<<<<< HEAD
// src/server.ts (CORREGIDO PARA INICIO ASÍNCRONO)

=======
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
import express from 'express';
import type { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import connectDB from './config/db.js';
import savingsRoutes from './routes/savingsRoutes.js';
<<<<<<< HEAD
import cors from 'cors'; // Aseguramos que cors se esté usando

dotenv.config();

const PORT = process.env.PORT || 3001; // Usamos el puerto 3001 para el backend

const app = express();
=======
import cors from 'cors';

dotenv.config();

console.log('Variables de entorno cargadas. Verificando MONGO_URI...');
console.log('URI:', process.env.MONGO_URI ? 'Cargada' : 'No cargada');

connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef

// Middlewares
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// Rutas de Salud
=======
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Servidor Ahorro Hormiga funcionando!');
});

app.use('/api/savings', savingsRoutes);
// Nota: Las rutas de historial deben estar definidas en server.ts si las creaste.

// ⬅️ FUNCIÓN PRINCIPAL ASÍNCRONA
const startServer = async () => {
    try {
        console.log('Variables de entorno cargadas. Intentando conectar a DB...');

        // 1. Conectar a la base de datos y esperar la conexión
        await connectDB();

        // 2. Iniciar el servidor Express solo después de una conexión exitosa
        app.listen(PORT, () => {
            console.log(`⚡️ Servidor corriendo en http://localhost:${PORT}`);
        });

    } catch (error) {
        // 3. Manejo de errores de conexión críticos
        console.error('❌ FALLO CRÍTICO AL INICIAR EL SERVIDOR O CONECTAR A DB:', error);
        process.exit(1);
    }
};

startServer(); // ⬅️ Llamamos a la función de inicio