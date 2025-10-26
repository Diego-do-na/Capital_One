<<<<<<< HEAD
// src/routes/savingsRoutes.ts (FINAL)

import { Router } from 'express';
// Importamos todas las exportaciones del controlador como un solo objeto.
=======
import { Router } from 'express';

>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
import * as savingsController from '../controllers/savingsController.js';

const router = Router();

<<<<<<< HEAD
// 1. GET /status/:accountId
// Obtiene el saldo y ahorro persistentes del cliente para inicializar el frontend.
router.get('/status/:accountId', savingsController.getCustomerStatus);

// 2. POST /mirror
// Ejecuta el algoritmo ML y la transferencia espejo (lógica central).
=======
router.post('/process', savingsController.processSavings);
router.put('/threshold', savingsController.setSavingsThreshold);
>>>>>>> a8e6c19a0ab32ecd6ffcbf6e3ac7447da95cd7ef
router.post('/mirror', savingsController.mirrorSavings);
router.get('/', savingsController.getSavings);

// NOTA: Las rutas /process (Batch) y /threshold (Umbral estático) han sido ELIMINADAS.

export default router;