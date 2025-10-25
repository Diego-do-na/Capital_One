// src/routes/savingsRoutes.ts
import { Router } from 'express';
import * as savingsController from '../controllers/savingsController';

const router = Router();

// POST: Endpoint principal para ejecutar el algoritmo de ahorro hormiga
// En un proyecto real, se debería enviar el accountId y el threshold
// Ejemplo de llamada: POST /api/savings/process
router.post('/process', savingsController.processSavings);

// PUT: Endpoint para que el cliente configure su umbral de "gasto hormiga"
// Ejemplo de llamada: PUT /api/savings/threshold
router.put('/threshold', savingsController.setSavingsThreshold);

export default router;