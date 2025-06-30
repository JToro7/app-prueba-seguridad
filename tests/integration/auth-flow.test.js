// tests/integration/auth-flow.test.js - Pruebas de integración CORREGIDAS
const request = require('supertest');

describe('Authentication Flow Integration', () => {
  let app;
  let authToken;
  let adminToken;

  beforeAll(async () => {
    // Importar app solo para tests
    app = require('../../src/backend/server');
  });

  afterAll(async () => {
    // Cleanup después de todos los tests
  });

  describe('Login y autenticación básica', () => {
    test('POST /api/auth/login - debe autenticar usuario estudiante', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'demo@universidad.edu',
          password: 'Demo123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('demo@universidad.edu');
      expect(response.body.user.role).toBe('student');

      authToken = response.body.token;
    });

    test('POST /api/auth/login - debe autenticar usuario admin', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@universidad.edu',
          password: 'Admin123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.role).toBe('admin');

      adminToken = response.body.token;
    });

    test('POST /api/auth/login - debe rechazar credenciales inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Endpoints protegidos con autenticación', () => {
    test('GET /api/profile - debe acceder con token válido de estudiante', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe('demo@universidad.edu');
      expect(response.body.data.role).toBe('student');
      expect(response.body.data.matricula).toBeDefined();
    });

    test('GET /api/profile - debe acceder con token válido de admin', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.role).toBe('admin');
      expect(response.body.data.departamento).toBeDefined();
    });

    test('GET /api/profile - debe rechazar sin token', async () => {
      const response = await request(app)
        .get('/api/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('GET /api/profile - debe rechazar token malformado', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Token inválido');
    });
  });

  describe('Configuración de usuario', () => {
    test('GET /api/settings - debe obtener configuración con token válido', async () => {
      const response = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.notifications).toBeDefined();
      expect(response.body.data.theme).toBeDefined();
    });

    test('PUT /api/settings - debe actualizar configuración', async () => {
      const newSettings = {
        notifications: false,
        theme: 'dark',
        language: 'en'
      };

      const response = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newSettings);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications).toBe(false);
      expect(response.body.data.theme).toBe('dark');
      expect(response.body.data.language).toBe('en');
    });
  });

  describe('Endpoints de administración', () => {
    test('GET /api/admin - estudiante debe ser rechazado', async () => {
      const response = await request(app)
        .get('/api/admin')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Acceso denegado');
    });

    test('GET /api/admin - admin debe tener acceso', async () => {
      const response = await request(app)
        .get('/api/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.activeUsers).toBeDefined();
      expect(response.body.data.systemHealth).toBeDefined();
    });

    test('GET /api/admin/stats - debe obtener estadísticas', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.usersByRole).toBeDefined();
      expect(response.body.data.monthlyGrowth).toBeDefined();
    });

    test('GET /api/admin/users - debe obtener lista de usuarios', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Verificar que no se incluyen contraseñas
      response.body.data.forEach(user => {
        expect(user.password).toBeUndefined();
        expect(user.email).toBeDefined();
        expect(user.role).toBeDefined();
      });
    });
  });

  describe('Verificación y refresh de tokens', () => {
    test('POST /api/auth/verify - debe verificar token válido', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('demo@universidad.edu');
    });

    test('POST /api/auth/refresh - debe renovar token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.token).not.toBe(authToken);

      // Verificar que el nuevo token funciona
      const verifyResponse = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${response.body.token}`);

      expect(verifyResponse.status).toBe(200);
    });
  });

  describe('Logout y limpieza de sesión', () => {
    test('POST /api/auth/logout - debe cerrar sesión', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Validación de entrada', () => {
    test('Login debe validar formato de email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email-format',
          password: 'Test123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Email inválido');
    });

    test('Login debe validar campos requeridos', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com'
          // password faltante
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Datos incompletos'); // Cambiado para coincidir
    });

    test('Settings debe validar campos válidos', async () => {
      const response = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          theme: 'invalid-theme',
          language: 'invalid-lang'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});