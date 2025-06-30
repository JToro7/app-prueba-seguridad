// src/backend/services/auth.service.js - Servicio de autenticación
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt.utils');

// Base de datos simulada de usuarios (en producción usarías una BD real)
const users = [
    {
        id: '1',
        email: 'demo@universidad.edu',
        password: '$2a$10$CwTycUXWue0Thq9StjUM0uO8WQS8V1ZKLQwu4WA.5.M1JQTQ1QV8q', // Demo123!
        name: 'Juan Pérez',
        role: 'student',
        provider: 'local',
        verified: true,
        active: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLoginAt: null
    },
    {
        id: '2',
        email: 'admin@universidad.edu',
        password: '$2a$10$HKJ9pDgGXVZvPl5BZx5XDO8YHTnQCBjO2Q7K3J8iDtLsNpP5JXqMy', // Admin123!
        name: 'María González',
        role: 'admin',
        provider: 'local',
        verified: true,
        active: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLoginAt: null
    },
    {
        id: '12345', // Para tests
        email: 'test@universidad.edu',
        password: '$2a$10$CwTycUXWue0Thq9StjUM0uO8WQS8V1ZKLQwu4WA.5.M1JQTQ1QV8q', // Test123!
        name: 'Usuario Test',
        role: 'student',
        provider: 'local',
        verified: true,
        active: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLoginAt: null
    }
];

/**
 * Autenticar usuario con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña en texto plano
 * @returns {Object} Resultado de la autenticación
 */
const authenticateUser = async (email, password) => {
    try {
        // Buscar usuario por email
        const user = users.find(u => u.email === email && u.active);
        
        if (!user) {
            return {
                success: false,
                error: 'Credenciales inválidas',
                message: 'Usuario no encontrado o inactivo'
            };
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return {
                success: false,
                error: 'Credenciales inválidas',
                message: 'Contraseña incorrecta'
            };
        }

        // Actualizar último login
        user.lastLoginAt = new Date().toISOString();

        // Generar token
        const token = generateToken(user);

        // Retornar usuario sin contraseña
        const userWithoutPassword = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            provider: user.provider,
            verified: user.verified,
            avatar: user.avatar || null,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
        };

        return {
            success: true,
            user: userWithoutPassword,
            token,
            message: 'Autenticación exitosa'
        };

    } catch (error) {
        console.error('Error en authenticateUser:', error);
        return {
            success: false,
            error: 'Error interno del servidor',
            message: 'Error durante la autenticación'
        };
    }
};

/**
 * Registrar nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Object} Resultado del registro
 */
const registerUser = async (userData) => {
    try {
        const { email, password, name, role = 'student' } = userData;

        // Verificar si el usuario ya existe
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return {
                success: false,
                error: 'Usuario ya existe',
                message: 'El email ya está registrado'
            };
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear nuevo usuario
        const newUser = {
            id: Date.now().toString(),
            email,
            password: hashedPassword,
            name,
            role,
            provider: 'local',
            verified: false,
            active: true,
            createdAt: new Date().toISOString(),
            lastLoginAt: null
        };

        users.push(newUser);

        // Retornar usuario sin contraseña
        const userWithoutPassword = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            provider: newUser.provider,
            verified: newUser.verified,
            createdAt: newUser.createdAt
        };

        return {
            success: true,
            user: userWithoutPassword,
            message: 'Usuario registrado exitosamente'
        };

    } catch (error) {
        console.error('Error en registerUser:', error);
        return {
            success: false,
            error: 'Error interno del servidor',
            message: 'Error durante el registro'
        };
    }
};

/**
 * Obtener usuario por ID
 * @param {string} userId - ID del usuario
 * @returns {Object|null} Usuario sin contraseña
 */
const getUserById = (userId) => {
    const user = users.find(u => u.id === userId && u.active);
    if (!user) {
        return null;
    }

    // Retornar sin contraseña
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

/**
 * Obtener usuario por email
 * @param {string} email - Email del usuario
 * @returns {Object|null} Usuario completo (para autenticación)
 */
const getUserByEmail = (email) => {
    return users.find(u => u.email === email && u.active) || null;
};

/**
 * Obtener todos los usuarios (para admin)
 * @returns {Array} Lista de usuarios sin contraseñas
 */
const getAllUsers = () => {
    return users
        .filter(u => u.active)
        .map(({ password, ...user }) => user);
};

/**
 * Validar contraseña
 * @param {string} plainPassword - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña hasheada
 * @returns {boolean} True si la contraseña es válida
 */
const validatePassword = async (plainPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.error('Error validando contraseña:', error);
        return false;
    }
};

/**
 * Hash de contraseña
 * @param {string} password - Contraseña en texto plano
 * @returns {string} Contraseña hasheada
 */
const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        console.error('Error hasheando contraseña:', error);
        throw new Error('Error al procesar contraseña');
    }
};

module.exports = {
    authenticateUser,
    registerUser,
    getUserById,
    getUserByEmail,
    getAllUsers,
    validatePassword,
    hashPassword
};