const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();


// Importar configuraciones
const { configurePassport } = require('./config/passport');
const { limiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const apiRoutes = require('./routes/api.routes');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Rate limiting
app.use('/api/', limiter);

// Configurar Passport
configurePassport();

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Servir frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Middleware de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;