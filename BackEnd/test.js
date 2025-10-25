// test-setup.js - Verifica que todo funcione
import dotenv from 'dotenv';
dotenv.config();

console.log('🔑 Verificando configuración:');
console.log('MongoDB URI:', process.env.MONGODB_URI ? '✅' : '❌');
console.log('Nessie API Key:', process.env.NESSIE_API_KEY ? '✅' : '❌');
console.log('PORT:', process.env.PORT || 3000);