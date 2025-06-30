const jwt = require('jsonwebtoken');
const { getUserByEmail, validatePassword } = require('../config/passport');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-super-segura';

// Función para generar JWT
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            role: user.role,
            name: user.name,
            provider: user.provider || 'local',
            avatar: user.avatar || null
        },
        JWT_SECRET,
        { expiresIn: '24h' } // Token válido por 24 horas
    );
};

// Login tradicional con email/password
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar entrada
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Datos incompletos',
                message: 'Email y contraseña son requeridos'
            });
        }

        // Buscar usuario
        const user = getUserByEmail(email);
        if (!user) {
            console.log(`❌ Usuario no encontrado: ${email}`);
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas',
                message: 'Email o contraseña incorrectos'
            });
        }

        // Validar contraseña
        const isValidPassword = await validatePassword(password, user.password);
        if (!isValidPassword) {
            console.log(`❌ Contraseña incorrecta para: ${email}`);
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas',
                message: 'Email o contraseña incorrectos'
            });
        }

        // Actualizar último login
        user.lastLoginAt = new Date().toISOString();

        // Generar token
        const token = generateToken(user);

        console.log(`✅ Login exitoso: ${email} (${user.provider})`);

        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                provider: user.provider || 'local',
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: 'Ocurrió un error durante el proceso de autenticación'
        });
    }
};

// Verificar token JWT
const verifyToken = (req, res) => {
    try {
        // El middleware authenticateToken ya verificó el token
        // y agregó la información del usuario a req.user
        res.json({
            success: true,
            user: req.user,
            message: 'Token válido'
        });
    } catch (error) {
        console.error('❌ Error verificando token:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: 'Error al verificar token'
        });
    }
};

// Refresh token (generar nuevo token)
const refreshToken = (req, res) => {
    try {
        // El middleware ya verificó que el token actual es válido
        const user = req.user;
        
        // Generar nuevo token
        const newToken = generateToken(user);
        
        res.json({
            success: true,
            token: newToken,
            message: 'Token renovado exitosamente'
        });
    } catch (error) {
        console.error('❌ Error renovando token:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: 'Error al renovar token'
        });
    }
};

// Callback exitoso de OAuth
const oauthSuccess = (req, res) => {
    try {
        if (!req.user) {
            console.log('❌ OAuth callback sin usuario');
            return res.redirect('/?error=oauth_no_user');
        }

        // Generar JWT para el usuario autenticado con OAuth
        const token = generateToken(req.user);
        
        console.log(`✅ OAuth exitoso: ${req.user.email} (${req.user.provider})`);
        
        // Redirigir al frontend con el token
        res.redirect(`/?token=${token}&oauth=success&provider=${req.user.provider}`);
        
    } catch (error) {
        console.error('❌ Error en OAuth callback:', error);
        res.redirect('/?error=oauth_callback_error');
    }
};

// Manejo de error de OAuth
const oauthError = (req, res) => {
    console.log('❌ Error en OAuth authentication');
    res.redirect('/?error=oauth_failed');
};

// Logout (invalidar sesión)
const logout = (req, res) => {
    try {
        // Cerrar sesión de Passport
        req.logout((err) => {
            if (err) {
                console.error('❌ Error en logout:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error al cerrar sesión'
                });
            }
            
            console.log(`✅ Logout exitoso`);
            res.json({
                success: true,
                message: 'Sesión cerrada exitosamente'
            });
        });
    } catch (error) {
        console.error('❌ Error en logout:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Obtener información del usuario actual
const getCurrentUser = (req, res) => {
    try {
        const user = req.user;
        
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                provider: user.provider || 'local',
                avatar: user.avatar,
                verified: user.verified,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt
            }
        });
    } catch (error) {
        console.error('❌ Error obteniendo usuario actual:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

module.exports = {
    login,
    verifyToken,
    refreshToken,
    oauthSuccess,
    oauthError,
    logout,
    getCurrentUser,
    generateToken
};