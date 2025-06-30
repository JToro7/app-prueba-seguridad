// Middleware de validación para rutas de autenticación

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    // Validar que existan los campos
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Datos incompletos',
            message: 'Email y contraseña son requeridos'
        });
    }
    
    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: 'Email inválido',
            message: 'El formato del email no es válido'
        });
    }
    
    // Validar longitud de contraseña
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            error: 'Contraseña muy corta',
            message: 'La contraseña debe tener al menos 6 caracteres'
        });
    }
    
    next();
};

const validateRegister = (req, res, next) => {
    const { email, password, name } = req.body;
    
    // Validar campos requeridos
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Datos incompletos',
            message: 'Email y contraseña son requeridos'
        });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: 'Email inválido',
            message: 'El formato del email no es válido'
        });
    }
    
    // Validar fortaleza de contraseña
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            error: 'Contraseña débil',
            message: 'La contraseña debe tener al menos 8 caracteres'
        });
    }
    
    // Validar que contenga al menos un número y una letra
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            error: 'Contraseña débil',
            message: 'La contraseña debe contener al menos una letra y un número'
        });
    }
    
    // Validar nombre si se proporciona
    if (name && name.length < 2) {
        return res.status(400).json({
            success: false,
            error: 'Nombre inválido',
            message: 'El nombre debe tener al menos 2 caracteres'
        });
    }
    
    next();
};

const validateEmail = (req, res, next) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({
            success: false,
            error: 'Email requerido',
            message: 'Se debe proporcionar un email'
        });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: 'Email inválido',
            message: 'El formato del email no es válido'
        });
    }
    
    next();
};

const sanitizeInput = (req, res, next) => {
    // Limpiar inputs de caracteres peligrosos
    const sanitize = (str) => {
        if (typeof str !== 'string') return str;
        return str.trim()
                  .replace(/[<>]/g, '') // Remover < y >
                  .replace(/javascript:/gi, '') // Remover javascript:
                  .replace(/on\w+=/gi, ''); // Remover event handlers
    };
    
    // Sanitizar body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitize(req.body[key]);
            }
        });
    }
    
    // Sanitizar query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitize(req.query[key]);
            }
        });
    }
    
    next();
};

module.exports = {
    validateLogin,
    validateRegister,
    validateEmail,
    sanitizeInput
};