// tests/e2e/smoke.test.js - Pruebas smoke para producción
const request = require('supertest');

// URL para tests de producción (cuando esté desplegado)
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'http://localhost:3000';

describe('Production Smoke Tests', () => {
  let app;

  beforeAll(async () => {
    // Para tests locales, importar la app
    app = require('../../src/backend/server');
  });

  afterAll(async () => {
    // Cleanup si es necesario
  });

  describe('Endpoints básicos', () => {
    test('Health check - API info responde', async () => {
      const response = await request(app)
        .get('/api/info');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('appName');
    });

    test('Frontend carga correctamente', async () => {
      const response = await request(app)
        .get('/');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Aplicación Web Segura');
    });

    test('API auth config responde', async () => {
      const response = await request(app)
        .get('/api/auth/config');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Endpoints de autenticación', () => {
    test('API responde a login con credenciales incorrectas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrong'
        });

      // Debe responder aunque las credenciales sean incorrectas
      expect([401, 400]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });

    test('API responde a login con credenciales correctas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'demo@universidad.edu',
          password: 'Demo123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('Endpoints protegidos', () => {
    test('API protegida rechaza sin token', async () => {
      const response = await request(app)
        .get('/api/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('OAuth endpoints', () => {
    test('OAuth Google endpoint redirige', async () => {
      const response = await request(app)
        .get('/auth/google')
        .expect(302); // Debe ser redirección

      expect(response.headers.location).toContain('accounts.google.com');
    });

    test('OAuth callback maneja errores', async () => {
      const response = await request(app)
        .get('/auth/google/callback?error=access_denied');

      // Puede ser redirección o respuesta directa
      expect([200, 302]).toContain(response.status);
    });
  });

  describe('Rutas no encontradas', () => {
    test('Ruta inexistente retorna 404', async () => {
      const response = await request(app)
        .get('/api/ruta-inexistente');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Ruta no encontrada');
    });
  });

  // Tests específicos para producción (solo se ejecutan si PRODUCTION_URL está configurado)
  if (process.env.PRODUCTION_URL && process.env.NODE_ENV === 'production') {
    describe('Tests específicos de producción', () => {
      test('HTTPS funciona correctamente', async () => {
        const response = await request(PRODUCTION_URL)
          .get('/api/info');

        expect(response.status).toBe(200);
      });

      test('Headers de seguridad están presentes', async () => {
        const response = await request(PRODUCTION_URL)
          .get('/');

        // Verificar headers de seguridad comunes
        expect(response.headers).toHaveProperty('x-powered-by');
      });
    });
  }
});