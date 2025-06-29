// tests/integration/auth-flow.test.js - Pruebas de integración
const request = require('supertest');
const app = require('../../src/backend/server');

describe('Authentication Flow Integration', () => {
  let authToken;

  test('POST /api/auth/login - debe autenticar usuario', async () => {
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

    authToken = response.body.token;
  });

  test('GET /api/profile - debe acceder con token válido', async () => {
    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe('demo@universidad.edu');
  });

  test('GET /api/profile - debe rechazar sin token', async () => {
    const response = await request(app)
      .get('/api/profile');

    expect(response.status).toBe(401);
  });

  test('POST /api/auth/refresh - debe renovar token', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.token).not.toBe(authToken);
  });

  test('POST /api/auth/logout - debe cerrar sesión', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});