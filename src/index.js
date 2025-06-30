// src/index.js - Punto de entrada que separa app de servidor para testing
const app = require('./backend/server');

// Solo iniciar servidor si NO estamos en modo test
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    
    const server = app.listen(PORT, () => {
        console.log(`
🚀 Servidor iniciado exitosamente
📍 Puerto: ${PORT}
🌐 URL: http://localhost:${PORT}
🔐 Entorno: ${process.env.NODE_ENV || 'development'}
        `);
    });

    // Manejo graceful de cierre
    process.on('SIGTERM', () => {
        console.log('SIGTERM recibido, cerrando servidor...');
        server.close(() => {
            console.log('Servidor cerrado exitosamente');
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        console.log('SIGINT recibido, cerrando servidor...');
        server.close(() => {
            console.log('Servidor cerrado exitosamente');
            process.exit(0);
        });
    });
}

// Exportar app para tests
module.exports = app;