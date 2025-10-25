// Este archivo debería estar en src/server.js, no en services/
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from '../config/db.js';

// Import routes
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import savingsRoutes from './routes/savingsRoutes.js';
import automateRoutes from './routes/automateRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a la base de datos
connectDB().then(() => {
  console.log('✅ Database connected successfully');
}).catch(error => {
  console.error('❌ Database connection failed:', error);
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/automate', automateRoutes);

// Health check with all endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: '🪞 Mirror API funcionando!',
    version: '1.0.0',
    endpoints: {
      users: {
        register: 'POST /api/users/register',
        getProfile: 'GET /api/users/:id',
        updateGoal: 'PUT /api/users/:id/savings-goal'
      },
      transactions: {
        getTransactions: 'GET /api/transactions/users/:userId',
        analyze: 'POST /api/transactions/analyze',
        sync: 'POST /api/transactions/sync'
      },
      savings: {
        transfer: 'POST /api/savings/transfer',
        getHistory: 'GET /api/savings/users/:userId',
        getProgress: 'GET /api/savings/users/:userId/progress'
      },
      automate: {
        process: 'POST /api/automate/process/:userId',
        status: 'GET /api/automate/status/:userId'
      }
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: {
      base: 'GET /',
      users: 'GET /api/users',
      transactions: 'GET /api/transactions',
      savings: 'GET /api/savings',
      automate: 'GET /api/automate'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mirror API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});