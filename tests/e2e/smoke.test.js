// tests/e2e/smoke.test.js - Pruebas smoke para producción
const request = require('supertest');

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://miapp.com';

describe('Production Smoke Tests', () => {
  test('Health check - servidor responde', async () => {
    const response = await request(PRODUCTION_URL)
      .get('/health');

    expect(response.status).toBe(200);
  });

  test('Frontend carga correctamente', async () => {
    const response = await request(PRODUCTION_URL)
      .get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Aplicación Segura');
  });

  test('API responde a login', async () => {
    const response = await request(PRODUCTION_URL)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'wrong'
      });

    // Debe responder aunque las credenciales sean incorrectas
    expect([401, 400]).toContain(response.status);
  });
});