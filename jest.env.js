// jest.env.js - Variables de entorno específicas para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-jest-testing-super-secure';
process.env.SESSION_SECRET = 'test-session-secret-for-jest';
process.env.PORT = '0'; // Puerto aleatorio para evitar conflictos

// OAuth configuración para tests (usar credenciales de test o mock)
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GOOGLE_PROJECT_ID = 'test-project-id';
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:3000/auth/google/callback';

// Base de datos para tests (si usas una)
process.env.DATABASE_URL = 'test-database-url';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-app';

// Configuración de CORS para tests
process.env.CORS_ORIGIN = 'http://localhost:3000';

// Configuración de logging para tests
process.env.LOG_LEVEL = 'error'; // Solo errores durante tests

// URLs para tests
process.env.PRODUCTION_URL = 'http://localhost:3000';

console.log('🧪 Variables de entorno configuradas para Jest testing');