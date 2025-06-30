const express = require('express');
const { passport } = require('../config/passport');
const { 
    login, 
    verifyToken, 
    refreshToken, 
    oauthSuccess, 
    oauthError, 
    logout, 
    getCurrentUser 
} = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.js');
const { validateLogin } = require('../middleware/validation');

const router = express.Router();

// ===========================================
// RUTAS DE AUTENTICACIÓN TRADICIONAL
// ===========================================

// POST /api/auth/login - Login con email/password
router.post('/login', validateLogin, login);

// POST /api/auth/verify - Verificar token JWT
router.post('/verify', authenticateToken, verifyToken);

// POST /api/auth/refresh - Renovar token JWT
router.post('/refresh', authenticateToken, refreshToken);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', logout);

// GET /api/auth/me - Obtener usuario actual
router.get('/me', authenticateToken, getCurrentUser);

// ===========================================
// RUTAS OAUTH CON GOOGLE
// ===========================================

// GET /auth/google - Iniciar OAuth con Google
router.get('/google',
    (req, res, next) => {
        console.log('🚀 Iniciando OAuth con Google...');
        next();
    },
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account' // Fuerza selección de cuenta
    })
);

// GET /auth/google/callback - Callback de Google OAuth
router.get('/google/callback',
    (req, res, next) => {
        console.log('📩 Callback recibido de Google OAuth');
        next();
    },
    passport.authenticate('google', { 
        failureRedirect: '/?error=oauth_failed',
        session: true
    }),
    oauthSuccess
);

// ===========================================
// RUTAS DE INFORMACIÓN Y DEPURACIÓN
// ===========================================

// GET /api/auth/status - Estado de la autenticación
router.get('/status', (req, res) => {
    const isAuthenticated = req.isAuthenticated ? req.isAuthenticated() : false;
    
    res.json({
        success: true,
        data: {
            authenticated: isAuthenticated,
            user: isAuthenticated ? {
                id: req.user?.id,
                email: req.user?.email,
                provider: req.user?.provider
            } : null,
            session: {
                exists: !!req.session,
                id: req.sessionID
            },
            oauth: {
                google: {
                    configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
                    client_id: process.env.GOOGLE_CLIENT_ID ? 'Configurado' : 'No configurado',
                    callback_url: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
                }
            }
        }
    });
});

// GET /api/auth/config - Configuración pública (sin secretos)
router.get('/config', (req, res) => {
    res.json({
        success: true,
        data: {
            providers: {
                local: true,
                google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
            },
            oauth: {
                google: {
                    client_id: process.env.GOOGLE_CLIENT_ID || null,
                    project_id: process.env.GOOGLE_PROJECT_ID || null,
                    callback_url: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
                }
            },
            features: [
                'JWT Authentication',
                'Google OAuth 2.0',
                'Session Management',
                'Role-based Access Control'
            ]
        }
    });
});

// ===========================================
// MIDDLEWARE DE MANEJO DE ERRORES OAUTH
// ===========================================

// Middleware para capturar errores de OAuth
router.use((err, req, res, next) => {
    if (err.name === 'GoogleOAuthError' || err.message.includes('oauth')) {
        console.error('❌ Error OAuth capturado:', err.message);
        return res.redirect('/?error=oauth_error&details=' + encodeURIComponent(err.message));
    }
    next(err);
});

module.exports = router;