import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Connection URI from MongoDB Atlas
const uri = process.env.MONGODB_URI;

// Create a new MongoClient
const client = new MongoClient(uri);

let database;

export const connectDB = async () => {
  try {
    // Connect the client to the server
    await client.connect();
    
    // Set the database
    database = client.db('mirror');
    
    console.log('✅ Conectado a MongoDB Atlas exitosamente');
    console.log('📊 Base de datos:', database.databaseName);
    
    return database;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1); // Exit if can't connect to DB
  }
};

// Function to get the database instance
export const getDB = () => {
  if (!database) {
    throw new Error('⚠️ La base de datos no está conectada. Llama a connectDB() primero.');
  }
  return database;
};

// Function to close the connection (optional)
export const closeDB = async () => {
  await client.close();
  console.log('🔌 Conexión a MongoDB cerrada');
};

// Export the client in case you need it
export { client };