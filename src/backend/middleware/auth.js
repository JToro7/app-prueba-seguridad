const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-super-segura';

// Middleware de autenticación JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            error: 'Token de acceso requerido',
            message: 'No se proporcionó token de autenticación'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Error al verificar token:', err.message);
            return res.status(403).json({ 
                error: 'Token inválido',
                message: 'El token proporcionado no es válido o ha expirado'
            });
        }
        req.user = user;
        next();
    });
};

// Middleware de autorización por roles
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'No autenticado',
                message: 'Se requiere autenticación'
            });
        }

        // Convertir roles a array si es string
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Acceso denegado',
                message: `Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    });
};

// Middleware de validación de token (solo verifica sin autenticar)
const validateToken = (req, res, next) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            error: 'Token requerido',
            message: 'Se debe proporcionar un token para validar'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(400).json({
                error: 'Token inválido',
                message: 'El token proporcionado no es válido',
                details: err.message
            });
        }

        req.tokenData = decoded;
        next();
    });
};

// Middleware de logging de autenticación
const logAuth = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    console.log(`[${timestamp}] AUTH LOG: ${req.method} ${req.path} - IP: ${ip} - User: ${req.user ? req.user.email : 'Anonymous'} - UserAgent: ${userAgent}`);
    
    next();
};

// Exportar todas las funciones
module.exports = {
    authenticateToken,
    authorizeRole,
    optionalAuth,
    validateToken,
    logAuth
};