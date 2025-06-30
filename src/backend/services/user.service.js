// src/backend/services/user.service.js - Servicio de usuarios
const { getUserById, getAllUsers } = require('./auth.service');

// Datos mock para configuraciones de usuario
const userSettings = {
    '1': {
        notifications: true,
        theme: 'light',
        language: 'es',
        twoFactorAuth: false,
        privacyLevel: 'medium',
        emailNotifications: true,
        pushNotifications: false
    },
    '2': {
        notifications: true,
        theme: 'dark',
        language: 'es',
        twoFactorAuth: true,
        privacyLevel: 'high',
        emailNotifications: true,
        pushNotifications: true
    },
    '12345': { // Usuario de test
        notifications: true,
        theme: 'light',
        language: 'es',
        twoFactorAuth: false,
        privacyLevel: 'medium',
        emailNotifications: true,
        pushNotifications: false
    }
};

// Datos mock para cursos
const userCourses = {
    '1': [
        {
            id: 'cs101',
            name: 'Introducción a la Programación',
            code: 'CS-101',
            credits: 3,
            semester: '2024-1',
            status: 'active',
            grade: null,
            professor: 'Dr. García'
        },
        {
            id: 'math201',
            name: 'Cálculo Diferencial',
            code: 'MATH-201',
            credits: 4,
            semester: '2024-1',
            status: 'active',
            grade: null,
            professor: 'Dra. López'
        }
    ],
    '12345': [
        {
            id: 'test101',
            name: 'Curso de Prueba',
            code: 'TEST-101',
            credits: 3,
            semester: '2024-1',
            status: 'active',
            grade: 85,
            professor: 'Prof. Test'
        }
    ]
};

/**
 * Buscar usuario por ID
 * @param {string} userId - ID del usuario
 * @returns {Object|undefined} Usuario encontrado
 */
const findUserById = async (userId) => {
    try {
        return getUserById(userId);
    } catch (error) {
        console.error('Error en findUserById:', error);
        return undefined;
    }
};

/**
 * Buscar usuario por email
 * @param {string} email - Email del usuario
 * @returns {Object|undefined} Usuario encontrado
 */
const findUserByEmail = async (email) => {
    try {
        const { getUserByEmail } = require('./auth.service');
        const user = getUserByEmail(email);
        
        if (!user) {
            return undefined;
        }

        // Retornar sin contraseña
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        console.error('Error en findUserByEmail:', error);
        return undefined;
    }
};

/**
 * Obtener perfil completo del usuario
 * @param {string} userId - ID del usuario
 * @returns {Object} Perfil del usuario
 * @throws {Error} Si el usuario no existe
 */
const getUserProfile = async (userId) => {
    try {
        const user = getUserById(userId);
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Agregar información adicional según el rol
        const profile = {
            ...user,
            profileComplete: true,
            lastActivity: new Date().toISOString()
        };

        // Información específica por rol
        if (user.role === 'student') {
            profile.matricula = '2021-001234';
            profile.carrera = 'Ingeniería en Sistemas';
            profile.semestre = '8vo';
            profile.creditsCompleted = 120;
            profile.gpa = 3.8;
        } else if (user.role === 'admin') {
            profile.departamento = 'Sistemas';
            profile.permissions = ['read', 'write', 'delete', 'admin'];
            profile.managedUsers = getAllUsers().length;
        }

        return profile;
    } catch (error) {
        console.error('Error en getUserProfile:', error);
        throw error;
    }
};

/**
 * Obtener configuración del usuario
 * @param {string} userId - ID del usuario
 * @returns {Object} Configuración del usuario
 */
const getUserSettings = async (userId) => {
    try {
        // Retornar configuración existente o default
        return userSettings[userId] || {
            notifications: true,
            theme: 'light',
            language: 'es',
            twoFactorAuth: false,
            privacyLevel: 'medium',
            emailNotifications: true,
            pushNotifications: false
        };
    } catch (error) {
        console.error('Error en getUserSettings:', error);
        throw new Error('Error al obtener configuración del usuario');
    }
};

/**
 * Actualizar configuración del usuario
 * @param {string} userId - ID del usuario
 * @param {Object} newSettings - Nueva configuración
 * @returns {Object} Configuración actualizada
 */
const updateUserSettings = async (userId, newSettings) => {
    try {
        // Obtener configuración actual
        const currentSettings = await getUserSettings(userId);
        
        // Validar configuración
        const allowedSettings = [
            'notifications', 'theme', 'language', 'twoFactorAuth', 
            'privacyLevel', 'emailNotifications', 'pushNotifications'
        ];
        
        const validSettings = {};
        Object.keys(newSettings).forEach(key => {
            if (allowedSettings.includes(key)) {
                validSettings[key] = newSettings[key];
            }
        });

        // Actualizar configuración
        const updatedSettings = {
            ...currentSettings,
            ...validSettings,
            updatedAt: new Date().toISOString()
        };

        userSettings[userId] = updatedSettings;
        
        return updatedSettings;
    } catch (error) {
        console.error('Error en updateUserSettings:', error);
        throw new Error('Error al actualizar configuración del usuario');
    }
};

/**
 * Obtener cursos del usuario
 * @param {string} userId - ID del usuario
 * @returns {Array} Lista de cursos
 */
const getUserCourses = async (userId) => {
    try {
        const user = getUserById(userId);
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Solo estudiantes y profesores tienen cursos
        if (!['student', 'teacher'].includes(user.role)) {
            return [];
        }

        return userCourses[userId] || [];
    } catch (error) {
        console.error('Error en getUserCourses:', error);
        throw new Error('Error al obtener cursos del usuario');
    }
};

/**
 * Actualizar perfil del usuario
 * @param {string} userId - ID del usuario
 * @param {Object} updateData - Datos a actualizar
 * @returns {Object} Perfil actualizado
 */
const updateUserProfile = async (userId, updateData) => {
    try {
        const user = getUserById(userId);
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Campos permitidos para actualizar
        const allowedFields = ['name', 'avatar', 'phone', 'bio'];
        const validUpdates = {};
        
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                validUpdates[key] = updateData[key];
            }
        });

        // En una implementación real, actualizarías la base de datos
        // Por ahora, simulamos la actualización
        const updatedUser = {
            ...user,
            ...validUpdates,
            updatedAt: new Date().toISOString()
        };

        return updatedUser;
    } catch (error) {
        console.error('Error en updateUserProfile:', error);
        throw error;
    }
};

/**
 * Obtener estadísticas del usuario
 * @param {string} userId - ID del usuario
 * @returns {Object} Estadísticas del usuario
 */
const getUserStats = async (userId) => {
    try {
        const user = getUserById(userId);
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const stats = {
            loginCount: Math.floor(Math.random() * 100) + 1,
            lastLoginDaysAgo: Math.floor(Math.random() * 30),
            profileViews: Math.floor(Math.random() * 50),
            accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        };

        if (user.role === 'student') {
            const courses = await getUserCourses(userId);
            stats.coursesEnrolled = courses.length;
            stats.coursesCompleted = courses.filter(c => c.grade !== null).length;
            stats.averageGrade = courses.reduce((acc, c) => acc + (c.grade || 0), 0) / courses.length || 0;
        }

        return stats;
    } catch (error) {
        console.error('Error en getUserStats:', error);
        throw new Error('Error al obtener estadísticas del usuario');
    }
};

module.exports = {
    findUserById,
    findUserByEmail,
    getUserProfile,
    getUserSettings,
    updateUserSettings,
    getUserCourses,
    updateUserProfile,
    getUserStats
};