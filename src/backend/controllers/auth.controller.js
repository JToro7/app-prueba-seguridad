
const authService = require('../services/auth.service');
const { generateToken } = require('../utils/jwt.utils');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.authenticateUser(email, password);
    
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }
    
    const token = generateToken(result.user);
    
    res.json({
      success: true,
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const oauthCallback = (req, res) => {
  try {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/error`);
  }
};

const refreshToken = (req, res) => {
  try {
    const newToken = generateToken(req.user);
    res.json({ token: newToken });
  } catch (error) {
    res.status(500).json({ error: 'Error al renovar token' });
  }
};

const logout = async (req, res) => {
  try {
    // En producción, agregar token a blacklist
    await authService.invalidateToken(req.headers.authorization);
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};

module.exports = {
  login,
  oauthCallback,
  refreshToken,
  logout
};