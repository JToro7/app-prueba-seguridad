const { generateToken, verifyToken, decodeToken } = require('../../src/backend/utils/jwt.utils');
const { authenticateUser } = require('../../src/backend/services/auth.service');
const { validateLogin } = require('../../src/backend/middleware/validation');

describe('JWT Utils', () => {
  const mockUser = {
    id: '12345',
    email: 'test@universidad.edu',
    role: 'student'
  };

  test('debe generar un token JWT válido', () => {
    const token = generateToken(mockUser);
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  test('debe verificar un token válido', () => {
    const token = generateToken(mockUser);
    const verified = verifyToken(token);
    
    expect(verified).toBeDefined();
    expect(verified.sub).toBe(mockUser.id);
    expect(verified.email).toBe(mockUser.email);
    expect(verified.role).toBe(mockUser.role);
  });

  test('debe rechazar un token inválido', () => {
    const invalidToken = 'invalid.token.here';
    const verified = verifyToken(invalidToken);
    
    expect(verified).toBeNull();
  });

  test('debe decodificar un token sin verificar', () => {
    const token = generateToken(mockUser);
    const decoded = decodeToken(token);
    
    expect(decoded).toBeDefined();
    expect(decoded.sub).toBe(mockUser.id);
  });
});

describe('Authentication Service', () => {
  test('debe autenticar usuario con credenciales válidas', async () => {
    const result = await authenticateUser('demo@universidad.edu', 'Demo123!');
    
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('demo@universidad.edu');
  });

  test('debe rechazar credenciales inválidas', async () => {
    const result = await authenticateUser('invalid@test.com', 'wrong');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Credenciales inválidas');
  });

  test('debe rechazar contraseña incorrecta', async () => {
    const result = await authenticateUser('demo@universidad.edu', 'wrongpass');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Credenciales inválidas');
  });
});

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('debe validar login con datos correctos', () => {
    req.body = {
      email: 'test@universidad.edu',
      password: 'Test123!'
    };

    validateLogin(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('debe rechazar login sin email', () => {
    req.body = { password: 'Test123!' };

    validateLogin(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Email y contraseña son requeridos'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('debe rechazar email con formato inválido', () => {
    req.body = {
      email: 'invalid-email',
      password: 'Test123!'
    };

    validateLogin(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Formato de email inválido'
    });
  });
});