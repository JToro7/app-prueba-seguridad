const bcrypt = require('bcryptjs');
const { findUserByEmail } = require('./user.service');

const authenticateUser = async (email, password) => {
  try {
    const user = await findUserByEmail(email);
    
    if (!user) {
      return { success: false, error: 'Credenciales inválidas' };
    }
    
    // Para demo, aceptar Demo123!
    const isValidPassword = password === 'Demo123!' || 
      await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return { success: false, error: 'Credenciales inválidas' };
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Error en autenticación:', error);
    return { success: false, error: 'Error en autenticación' };
  }
};

const invalidateToken = async (token) => {
  // En producción, agregar a Redis o base de datos
  // para mantener una blacklist de tokens
  return true;
};

module.exports = {
  authenticateUser,
  invalidateToken
};