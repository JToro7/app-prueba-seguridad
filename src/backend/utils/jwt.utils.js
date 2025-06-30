// src/backend/utils/jwt.utils.js - Utilidades JWT
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-super-segura';

/**
 * Generar token JWT
 * @param {Object} user - Usuario para incluir en el token
 * @returns {string} Token JWT
 */
const generateToken = (user) => {
    try {
        const payload = {
            sub: user.id, // Subject (ID del usuario)
            email: user.email,
            role: user.role,
            name: user.name,
            provider: user.provider || 'local',
            avatar: user.avatar || null,
            iat: Math.floor(Date.now() / 1000), // Issued at
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Expira en 24 horas
        };

        return jwt.sign(payload, JWT_SECRET);
    } catch (error) {
        console.error('Error generando token JWT:', error);
        throw new Error('Error al generar token');
    }
};

/**
 * Verificar y decodificar token JWT
 * @param {string} token - Token a verificar
 * @returns {Object|null} Payload del token o null si es inválido
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('Error verificando token JWT:', error.message);
        return null;
    }
};

/**
 * Decodificar token sin verificar (solo para debugging)
 * @param {string} token - Token a decodificar
 * @returns {Object|null} Payload del token o null si es inválido
 */
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error('Error decodificando token JWT:', error);
        return null;
    }
};

/**
 * Verificar si un token ha expirado
 * @param {string} token - Token a verificar
 * @returns {boolean} True si ha expirado
 */
const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return true;
        }
        return decoded.exp < Math.floor(Date.now() / 1000);
    } catch (error) {
        return true;
    }
};

/**
 * Obtener tiempo restante del token en segundos
 * @param {string} token - Token a verificar
 * @returns {number} Segundos restantes (0 si expirado)
 */
const getTokenTimeRemaining = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return 0;
        }
        const remaining = decoded.exp - Math.floor(Date.now() / 1000);
        return Math.max(0, remaining);
    } catch (error) {
        return 0;
    }
};

/**
 * Refrescar token (generar nuevo token con mismos datos)
 * @param {string} token - Token original
 * @returns {string|null} Nuevo token o null si el original es inválido
 */
const refreshToken = (token) => {
    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return null;
        }

        // Crear nuevo token con mismos datos
        const user = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name,
            provider: decoded.provider,
            avatar: decoded.avatar
        };

        return generateToken(user);
    } catch (error) {
        console.error('Error refrescando token:', error);
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
    isTokenExpired,
    getTokenTimeRemaining,
    refreshToken
};