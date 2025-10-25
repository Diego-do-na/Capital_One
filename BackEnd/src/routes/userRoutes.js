import express from 'express';
import { 
  createUser, 
  findUserById, 
  updateUserSavingsGoal, 
  updateUserHormigaRules 
} from '../db/utils.js';

const router = express.Router();

// POST /api/users/register - Crear nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { name, email, nessieCustomerId } = req.body;
    
    const user = await createUser({
      _id: `user_${Date.now()}`,
      name,
      email,
      nessieCustomerId,
      createdAt: new Date()
    });
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      userId: user.insertedId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - Obtener perfil de usuario
router.get('/:id', async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id/savings-goal - Actualizar meta de ahorro
router.put('/:id/savings-goal', async (req, res) => {
  try {
    const { goal } = req.body;
    await updateUserSavingsGoal(req.params.id, goal);
    
    res.json({ message: 'Meta de ahorro actualizada', goal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id/rules - Actualizar reglas de gastos hormiga
router.put('/:id/rules', async (req, res) => {
  try {
    const { maxAmount, categories, isActive } = req.body;
    
    await updateUserHormigaRules(req.params.id, {
      maxAmount,
      categories,
      isActive
    });
    
    res.json({ message: 'Reglas actualizadas' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;