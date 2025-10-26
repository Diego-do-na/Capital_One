// src/routes/savingsRoutes.ts (FINAL)

import { Router } from 'express';
// Importamos todas las exportaciones del controlador como un solo objeto.
import * as savingsController from '../controllers/savingsController.js';

const router = Router();

// 1. GET /status/:accountId
// Obtiene el saldo y ahorro persistentes del cliente para inicializar el frontend.
router.get('/status/:accountId', savingsController.getCustomerStatus);

// 2. POST /mirror
// Ejecuta el algoritmo ML y la transferencia espejo (lógica central).
router.post('/mirror', savingsController.mirrorSavings);

// NOTA: Las rutas /process (Batch) y /threshold (Umbral estático) han sido ELIMINADAS.

export default router;