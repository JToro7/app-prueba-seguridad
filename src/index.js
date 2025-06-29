// src/index.js - Punto de entrada principal
const path = require('path');

// Cargar variables de entorno
require('dotenv').config();

// Validar variables de entorno críticas
const requiredEnvVars = ['JWT_SECRET', 'PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Faltan variables de entorno:', missingVars.join(', '));
  console.error('Por favor, crea un archivo .env basado en .env.example');
  process.exit(1);
}

// Iniciar servidor
const app = require('./backend/server');

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Señales de terminación
process.on('SIGTERM', () => {
  console.log('📛 SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📛 SIGINT recibido, cerrando servidor...');
  process.exit(0);
});