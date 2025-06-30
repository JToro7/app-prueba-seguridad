const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

// Base de datos simulada (en producción usar MongoDB, PostgreSQL, etc.)
const users = [
    {
        id: 1,
        email: 'demo@universidad.edu',
        password: '$2a$10$XfzSZmQZo5o5o5o5o5o5o.ABC123',
        role: 'student',
        name: 'Juan Pérez',
        provider: 'local'
    },
    {
        id: 2,
        email: 'admin@universidad.edu',
        password: '$2a$10$XfzSZmQZo5o5o5o5o5o5o.DEF456',
        role: 'admin',
        name: 'María González',
        provider: 'local'
    }
];

// Función para encontrar o crear usuario OAuth
const findOrCreateOAuthUser = async (profile, provider) => {
    console.log('🔍 Buscando/creando usuario OAuth:', {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        provider: provider
    });

    // Buscar usuario existente por email
    let user = users.find(u => u.email === profile.emails[0].value);
    
    if (!user) {
        // Crear nuevo usuario OAuth
        user = {
            id: users.length + 1,
            email: profile.emails[0].value,
            name: profile.displayName,
            role: 'user', // Rol por defecto para usuarios OAuth
            provider: provider,
            providerId: profile.id,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            verified: true,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
        };
        users.push(user);
        console.log(`✅ Nuevo usuario OAuth creado: ${user.email} (ID: ${user.id})`);
    } else {
        // Actualizar información del usuario existente
        user.name = profile.displayName;
        user.avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : user.avatar;
        user.lastLoginAt = new Date().toISOString();
        
        // Si el usuario existía como local, actualizar provider
        if (user.provider === 'local') {
            user.provider = 'hybrid'; // Usuario que usa tanto local como OAuth
        }
        
        console.log(`🔄 Usuario OAuth actualizado: ${user.email}`);
    }
    
    return user;
};

// Configuración de Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('🔐 Google OAuth Profile recibido:', {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0]?.value
        });
        
        const user = await findOrCreateOAuthUser(profile, 'google');
        
        // Agregar tokens OAuth al usuario (opcional para uso posterior)
        user.oauth = {
            accessToken: accessToken,
            refreshToken: refreshToken,
            provider: 'google'
        };
        
        return done(null, user);
        
    } catch (error) {
        console.error('❌ Error en Google OAuth Strategy:', error);
        return done(error, null);
    }
}));

// Serialización de usuario para sesiones
passport.serializeUser((user, done) => {
    console.log('📝 Serializando usuario:', user.id);
    done(null, user.id);
});

// Deserialización de usuario desde sesiones
passport.deserializeUser((id, done) => {
    console.log('🔍 Deserializando usuario:', id);
    const user = users.find(u => u.id === id);
    if (user) {
        console.log('✅ Usuario encontrado:', user.email);
        done(null, user);
    } else {
        console.log('❌ Usuario no encontrado:', id);
        done(new Error('Usuario no encontrado'), null);
    }
});

// Función helper para obtener todos los usuarios (para admin)
const getAllUsers = () => {
    return users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        provider: user.provider,
        avatar: user.avatar,
        verified: user.verified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
        // No incluir password ni tokens
    }));
};

// Función helper para obtener usuario por ID
const getUserById = (id) => {
    return users.find(u => u.id === id);
};

// Función helper para obtener usuario por email
const getUserByEmail = (email) => {
    return users.find(u => u.email === email);
};

// Función helper para validar password (para login local)
const validatePassword = async (password, hashedPassword) => {
    // Para la demo, validamos directamente
    if (password === 'Demo123!' && hashedPassword === '$2a$10$XfzSZmQZo5o5o5o5o5o5o.ABC123') {
        return true;
    }
    if (password === 'Admin123!' && hashedPassword === '$2a$10$XfzSZmQZo5o5o5o5o5o5o.DEF456') {
        return true;
    }
    return false;
    // En producción usar: return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
    passport,
    findOrCreateOAuthUser,
    getAllUsers,
    getUserById,
    getUserByEmail,
    validatePassword,
    users // Exportar para uso en otros módulos si es necesario
};