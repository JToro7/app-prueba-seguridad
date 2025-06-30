// jest.setup.js - Configuración global para Jest
require('dotenv').config({ path: '.env.test' });

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-super-secure';
process.env.PORT = '0'; // Puerto aleatorio para tests

// Configurar timeouts más largos para tests de integración
jest.setTimeout(10000);

// Mock global de console para tests más limpios (opcional)
global.console = {
  ...console,
  // Silenciar logs durante tests (descomentar si quieres logs silenciosos)
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Helper global para generar usuarios mock
global.createMockUser = (overrides = {}) => ({
  id: '12345',
  email: 'demo@universidad.edu',
  name: 'Juan Pérez',
  role: 'student',
  provider: 'local',
  avatar: null,
  verified: true,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  ...overrides
});

// Helper global para generar tokens mock
global.createMockToken = () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSIsImVtYWlsIjoiZGVtb0B1bml2ZXJzaWRhZC5lZHUiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MzI1NDIyfQ.signature';

// Configurar mocks comunes
beforeEach(() => {
  // Limpiar mocks antes de cada test
  jest.clearAllMocks();
});

afterEach(() => {
  // Limpiar después de cada test
  jest.restoreAllMocks();
});

// Configuración para tests de integración con supertest
global.testServer = null;

beforeAll(async () => {
  // Setup global si es necesario
});

afterAll(async () => {
  // Cleanup global
  if (global.testServer) {
    await global.testServer.close();
  }
});