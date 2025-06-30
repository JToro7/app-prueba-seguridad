// tests/unit/auth.test.js - CORREGIDO
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
      success: false,
      error: 'Datos incompletos',
      message: 'Email y contraseña son requeridos'
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
      success: false,
      error: 'Email inválido',
      message: 'El formato del email no es válido'
    });
  });
});

// tests/unit/user.test.js - CORREGIDO  
const userService = require('../../src/backend/services/user.service');

describe('User Service', () => {
  test('debe encontrar usuario por ID', async () => {
    const user = await userService.findUserById('12345');
    
    expect(user).toBeDefined();
    expect(user.id).toBe('12345');
    expect(user.email).toBe('test@universidad.edu'); // Cambiado a test@
  });

  test('debe retornar null para ID inexistente', async () => {
    const user = await userService.findUserById('99999');
    
    expect(user).toBeNull(); // Cambiado de toBeUndefined a toBeNull
  });

  test('debe encontrar usuario por email', async () => {
    const user = await userService.findUserByEmail('demo@universidad.edu');
    
    expect(user).toBeDefined();
    expect(user.email).toBe('demo@universidad.edu');
  });

  test('debe obtener perfil sin contraseña', async () => {
    const profile = await userService.getUserProfile('12345');
    
    expect(profile).toBeDefined();
    expect(profile.password).toBeUndefined();
    expect(profile.email).toBe('test@universidad.edu'); // Cambiado a test@
  });

  test('debe lanzar error para usuario inexistente', async () => {
    await expect(userService.getUserProfile('99999'))
      .rejects.toThrow('Usuario no encontrado');
  });

  test('debe obtener configuración del usuario', async () => {
    const settings = await userService.getUserSettings('12345');
    
    expect(settings).toBeDefined();
    expect(settings.notifications).toBe(true);
    expect(settings.theme).toBe('light');
  });

  test('debe obtener cursos del usuario', async () => {
    const courses = await userService.getUserCourses('12345');
    
    expect(courses).toBeDefined();
    expect(Array.isArray(courses)).toBe(true);
    expect(courses.length).toBeGreaterThan(0);
  });
});