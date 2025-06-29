// tests/unit/user.test.js - Pruebas del servicio de usuarios
const userService = require('../../src/backend/services/user.service');

describe('User Service', () => {
  test('debe encontrar usuario por ID', async () => {
    const user = await userService.findUserById('12345');
    
    expect(user).toBeDefined();
    expect(user.id).toBe('12345');
    expect(user.email).toBe('demo@universidad.edu');
  });

  test('debe retornar undefined para ID inexistente', async () => {
    const user = await userService.findUserById('99999');
    
    expect(user).toBeUndefined();
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
    expect(profile.email).toBe('demo@universidad.edu');
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