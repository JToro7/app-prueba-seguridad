const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const { passport } = require('./config/passport');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// CONFIGURACIÓN DE MIDDLEWARE BÁSICO
// ===========================================

// CORS configurado
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===========================================
// CONFIGURACIÓN DE SESIONES Y PASSPORT
// ===========================================

// Configurar sesiones para Passport OAuth
app.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        sameSite: 'lax'
    },
    name: 'sessionId'
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// ===========================================
// SERVIR ARCHIVOS ESTÁTICOS
// ===========================================

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../../public')));

// ===========================================
// RUTAS DE LA APLICACIÓN
// ===========================================

// Rutas de autenticación (incluye OAuth)
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

// ===========================================
// RUTAS DE API PROTEGIDAS
// ===========================================

// Middleware de autenticación JWT simple
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            error: 'Token de acceso requerido',
            message: 'No se proporcionó token de autenticación'
        });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-super-segura';

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
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

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Acceso denegado',
                message: `Se requiere uno de los siguientes roles: ${roles.join(', ')}`
            });
        }
        next();
    };
};

// Perfil del usuario
app.get('/api/profile', authenticateToken, (req, res) => {
    const { getUserById } = require('./config/passport');
    const user = getUserById(req.user.id);
    
    if (!user) {
        return res.status(404).json({
            error: 'Usuario no encontrado'
        });
    }

    res.json({
        success: true,
        data: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            provider: user.provider || 'local',
            avatar: user.avatar || null,
            matricula: user.role === 'student' ? '2021-001234' : null,
            carrera: user.role === 'student' ? 'Ingeniería en Sistemas' : null,
            semestre: user.role === 'student' ? '8vo' : null,
            departamento: user.role === 'admin' ? 'Sistemas' : null
        }
    });
});

// Configuración del usuario (GET)
app.get('/api/settings', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            notifications: true,
            theme: 'light',
            language: 'es',
            twoFactorAuth: false,
            privacyLevel: 'medium'
        }
    });
});

// Configuración del usuario (PUT) - NUEVO ENDPOINT
app.put('/api/settings', authenticateToken, (req, res) => {
    try {
        const { notifications, theme, language, twoFactorAuth } = req.body;
        
        // Validar datos de entrada
        const validThemes = ['light', 'dark'];
        const validLanguages = ['es', 'en', 'fr'];
        
        if (theme && !validThemes.includes(theme)) {
            return res.status(400).json({
                error: 'Tema inválido',
                message: `Temas válidos: ${validThemes.join(', ')}`
            });
        }
        
        if (language && !validLanguages.includes(language)) {
            return res.status(400).json({
                error: 'Idioma inválido', 
                message: `Idiomas válidos: ${validLanguages.join(', ')}`
            });
        }
        
        // Simular actualización (en producción guardarías en BD)
        const updatedSettings = {
            notifications: notifications !== undefined ? notifications : true,
            theme: theme || 'light',
            language: language || 'es',
            twoFactorAuth: twoFactorAuth !== undefined ? twoFactorAuth : false,
            privacyLevel: 'medium',
            updatedAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            message: 'Configuración actualizada exitosamente',
            data: updatedSettings
        });
        
    } catch (error) {
        console.error('Error actualizando configuración:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo actualizar la configuración'
        });
    }
});

// Panel de administración
app.get('/api/admin', authenticateToken, authorizeRole(['admin']), (req, res) => {
    const { getAllUsers } = require('./config/passport');
    const users = getAllUsers();
    
    res.json({
        success: true,
        data: {
            activeUsers: users.length,  // ← Cambiado de totalUsers a activeUsers
            totalUsers: users.length,   // ← Mantener también totalUsers por compatibilidad
            oauthUsers: users.filter(u => u.provider !== 'local').length,
            localUsers: users.filter(u => u.provider === 'local' || !u.provider).length,
            newRegistrationsToday: 5,
            systemHealth: 'excellent',
            serverUptime: '15 días, 3 horas'
        }
    });
});

// Estadísticas de administración
app.get('/api/admin/stats', authenticateToken, authorizeRole(['admin']), (req, res) => {
    res.json({
        success: true,
        data: {
            usersByRole: {
                students: 1180,
                teachers: 45,
                admin: 9
            },
            monthlyGrowth: {
                users: '+12%',
                courses: '+8%',
                activity: '+15%'
            },
            topCourses: [
                { name: 'Programación I', students: 89 },
                { name: 'Matemáticas', students: 76 },
                { name: 'Bases de Datos', students: 65 }
            ]
        }
    });
});

// Lista de usuarios para administradores - NUEVO ENDPOINT
app.get('/api/admin/users', authenticateToken, authorizeRole(['admin']), (req, res) => {
    try {
        const { getAllUsers } = require('./config/passport');
        const users = getAllUsers();
        
        // Filtrar información sensible y agregar datos mock adicionales
        const safeUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            provider: user.provider || 'local',
            active: user.active !== false,
            verified: user.verified !== false,
            createdAt: user.createdAt || new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            lastLoginAt: user.lastLoginAt || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            loginCount: Math.floor(Math.random() * 100) + 1
            // NO incluir password por seguridad
        }));
        
        // Agregar algunos usuarios mock adicionales para pruebas
        const mockUsers = [
            {
                id: 'mock-1',
                email: 'estudiante1@universidad.edu',
                name: 'Ana García',
                role: 'student',
                provider: 'local',
                active: true,
                verified: true,
                createdAt: '2024-01-15T10:30:00.000Z',
                lastLoginAt: '2024-12-20T14:22:00.000Z',
                loginCount: 45
            },
            {
                id: 'mock-2', 
                email: 'profesor1@universidad.edu',
                name: 'Dr. Carlos López',
                role: 'teacher',
                provider: 'google',
                active: true,
                verified: true,
                createdAt: '2023-09-10T08:15:00.000Z',
                lastLoginAt: '2024-12-28T16:45:00.000Z',
                loginCount: 127
            }
        ];
        
        const allUsers = [...safeUsers, ...mockUsers];
        
        res.json({
            success: true,
            data: allUsers,
            meta: {
                total: allUsers.length,
                active: allUsers.filter(u => u.active).length,
                byRole: {
                    student: allUsers.filter(u => u.role === 'student').length,
                    admin: allUsers.filter(u => u.role === 'admin').length,
                    teacher: allUsers.filter(u => u.role === 'teacher').length
                },
                byProvider: {
                    local: allUsers.filter(u => u.provider === 'local').length,
                    google: allUsers.filter(u => u.provider === 'google').length
                }
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            message: 'No se pudo obtener la lista de usuarios'
        });
    }
});

// ===========================================
// RUTAS PÚBLICAS
// ===========================================

// Información de la aplicación
app.get('/api/info', (req, res) => {
    res.json({
        success: true,
        data: {
            appName: 'Aplicación Web Segura - Universidad',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            features: [
                'Autenticación JWT',
                'OAuth 2.0 con Google',
                'Control de acceso basado en roles',
                'Validación de entrada',
                'Manejo de errores centralizado'
            ],
            oauth: {
                enabled: true,
                providers: ['google'],
                google: {
                    configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
                    client_id: process.env.GOOGLE_CLIENT_ID ? 'Configurado' : 'No configurado',
                    project_id: process.env.GOOGLE_PROJECT_ID || 'No configurado'
                }
            },
            endpoints: {
                auth: {
                    login: 'POST /api/auth/login',
                    oauth_google: 'GET /auth/google',
                    verify: 'POST /api/auth/verify',
                    logout: 'POST /api/auth/logout'
                },
                protected: {
                    profile: 'GET /api/profile',
                    settings: 'GET /api/settings',
                    update_settings: 'PUT /api/settings',
                    admin: 'GET /api/admin',
                    admin_stats: 'GET /api/admin/stats',
                    admin_users: 'GET /api/admin/users'
                }
            }
        }
    });
});

// Servir el frontend principal
app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, '../frontend/index.html');
    
    try {
        if (require('fs').existsSync(htmlPath)) {
            console.log('📄 Sirviendo frontend desde:', htmlPath);
            res.sendFile(htmlPath);
        } else {
            console.log('⚠️ No se encontró index.html, sirviendo página de fallback');
            // HTML de fallback mejorado
            res.send(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>App Segura - OAuth Configurado</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            margin: 0;
                            padding: 50px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            min-height: 100vh;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                        }
                        .container {
                            background: white;
                            color: #333;
                            padding: 40px;
                            border-radius: 20px;
                            max-width: 800px;
                            margin: 0 auto;
                            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                        }
                        .oauth-btn {
                            background: #4285f4;
                            color: white;
                            padding: 15px 30px;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                            text-decoration: none;
                            display: inline-block;
                            margin: 10px 5px;
                        }
                        .oauth-btn:hover {
                            background: #357ae8;
                        }
                        .status {
                            background: #f0f9ff;
                            border: 1px solid #0ea5e9;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .credentials {
                            background: #f0fdf4;
                            border: 1px solid #22c55e;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 15px 0;
                            font-family: monospace;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🔐 Servidor OAuth Funcionando</h1>
                        
                        <div class="status">
                            <h3>📊 Estado del Sistema:</h3>
                            <p><strong>Puerto:</strong> ${PORT}</p>
                            <p><strong>Entorno:</strong> ${process.env.NODE_ENV || 'development'}</p>
                            <p><strong>Google OAuth:</strong> ${process.env.GOOGLE_CLIENT_ID ? '✅ Configurado' : '❌ No configurado'}</p>
                            <p><strong>Project ID:</strong> ${process.env.GOOGLE_PROJECT_ID || 'No configurado'}</p>
                        </div>
                        
                        <div class="credentials">
                            <strong>🔧 URLs configuradas:</strong><br>
                            Callback URL: ${process.env.GOOGLE_CALLBACK_URL}<br>
                            Client ID: ${process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'No configurado'}
                        </div>
                        
                        <h3>🧪 Opciones de Prueba:</h3>
                        <a href="/auth/google" class="oauth-btn">🔗 Probar OAuth con Google</a>
                        <a href="/api/info" class="oauth-btn" style="background: #16a34a;">📊 Ver Info del Sistema</a>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            <h4>📋 Para ver el frontend completo:</h4>
                            <ol style="text-align: left; line-height: 1.6;">
                                <li>Asegúrate de que existe: <code>src/frontend/index.html</code></li>
                                <li>Reinicia el servidor: <code>npm run dev</code></li>
                                <li>Ve a <code>http://localhost:${PORT}</code></li>
                            </ol>
                        </div>
                        
                        <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; color: #92400e;">
                            <strong>⚠️ Nota:</strong> Esta es una página de fallback porque no se encontró <code>src/frontend/index.html</code>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }
    } catch (error) {
        console.error('❌ Error sirviendo frontend:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: 'No se pudo cargar la página principal'
        });
    }
});

// ===========================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ===========================================

// Middleware de manejo de errores centralizado
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

// Ruta 404 para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe`,
        availableRoutes: {
            auth: ['/auth/google', '/api/auth/login', '/api/auth/verify'],
            api: ['/api/info', '/api/profile', '/api/settings', '/api/admin', '/api/admin/stats', '/api/admin/users'],
            frontend: ['/']
        }
    });
});

// ===========================================
// INICIAR SERVIDOR
// ===========================================

app.listen(PORT, () => {
    console.log(`
🚀 Servidor OAuth iniciado exitosamente
📍 Puerto: ${PORT}
🌐 URL: http://localhost:${PORT}
🔐 Entorno: ${process.env.NODE_ENV || 'development'}

🔑 Configuración OAuth Google:
   Client ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configurado' : '❌ No configurado'}
   Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Configurado' : '❌ No configurado'}
   Project ID: ${process.env.GOOGLE_PROJECT_ID || '❌ No configurado'}
   Callback URL: ${process.env.GOOGLE_CALLBACK_URL || 'No configurado'}

📋 Usuarios de prueba (login tradicional):
   📧 demo@universidad.edu | 🔑 Demo123! | 👤 student
   📧 admin@universidad.edu | 🔑 Admin123! | 👤 admin

🛡️ Endpoints principales:
   🔗 GET  /auth/google - Iniciar OAuth con Google
   🔄 GET  /auth/google/callback - Callback de Google
   📝 POST /api/auth/login - Login tradicional
   ✅ POST /api/auth/verify - Verificar token
   🚪 POST /api/auth/logout - Cerrar sesión
   📊 GET  /api/info - Información del sistema
   👤 GET  /api/profile - Perfil del usuario
   ⚙️  GET  /api/settings - Configuración del usuario
   ⚙️  PUT  /api/settings - Actualizar configuración
   👨‍💼 GET  /api/admin - Panel de administración
   📊 GET  /api/admin/stats - Estadísticas de admin
   👥 GET  /api/admin/users - Lista de usuarios (admin)
   
🧪 Para probar OAuth:
   1. Ve a http://localhost:${PORT}
   2. Click en "Iniciar OAuth con Google"
   3. O usa el frontend completo en src/frontend/index.html
    `);
    
    // Verificar configuración al iniciar
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.log(`
⚠️  ADVERTENCIA: Google OAuth no está completamente configurado
   - Revisa tu archivo .env
   - Asegúrate de tener GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET
   - Credenciales actuales en .env: ${process.env.GOOGLE_CLIENT_ID ? 'Client ID ✅' : 'Client ID ❌'} | ${process.env.GOOGLE_CLIENT_SECRET ? 'Client Secret ✅' : 'Client Secret ❌'}
        `);
    } else {
        console.log(`
✅ Google OAuth completamente configurado y listo para usar!
🔗 Inicia OAuth en: http://localhost:${PORT}/auth/google
        `);
    }
});