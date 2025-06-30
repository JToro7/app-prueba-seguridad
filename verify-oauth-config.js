require('dotenv').config();
const { spawn } = require('child_process');

console.log('🔍 VERIFICANDO CONFIGURACIÓN OAUTH\n');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log(`✅ GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? 'Configurado' : '❌ Faltante'}`);
console.log(`✅ GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? 'Configurado' : '❌ Faltante'}`);
console.log(`✅ GOOGLE_CALLBACK_URL: ${process.env.GOOGLE_CALLBACK_URL || '❌ Faltante'}`);
console.log();

// Verificar URLs exactas
console.log('🌐 URLs que deben estar en Google Cloud Console:');
console.log('━'.repeat(60));
console.log('📍 Authorized JavaScript origins:');
console.log('   http://localhost:3000');
console.log();
console.log('📍 Authorized redirect URIs:');
console.log('   http://localhost:3000/auth/google/callback');
console.log('━'.repeat(60));
console.log();

// Verificar archivos
const fs = require('fs');
const path = require('path');

console.log('📁 Verificando archivos:');
const files = [
    'src/backend/server.js',
    'src/frontend/index.html',
    '.env'
];

files.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file}`);
});
console.log();

// Test de conectividad
const testServer = async () => {
    console.log('🧪 Probando servidor...');
    
    try {
        const response = await fetch('http://localhost:3000/api/info');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Servidor funcionando');
            console.log(`📊 OAuth configurado: ${data.data.oauth.google.configured ? 'Sí' : 'No'}`);
            
            // Probar ruta OAuth
            try {
                const oauthResponse = await fetch('http://localhost:3000/auth/google', {
                    method: 'GET',
                    redirect: 'manual'
                });
                
                console.log(`🔗 Ruta OAuth: ${oauthResponse.status === 302 ? '✅ Redirige correctamente' : '❌ No redirige'}`);
                
                if (oauthResponse.status === 302) {
                    const location = oauthResponse.headers.get('location');
                    console.log('🎯 Redirige a:', location ? location.substring(0, 80) + '...' : 'URL no encontrada');
                }
                
            } catch (err) {
                console.log('❌ Error probando ruta OAuth:', err.message);
            }
            
        } else {
            console.log('❌ Servidor no responde correctamente');
        }
    } catch (error) {
        console.log('❌ No se puede conectar al servidor en http://localhost:3000');
        console.log('💡 Ejecuta: npm run dev');
    }
};

// Instrucciones finales
console.log('🔧 INSTRUCCIONES PARA SOLUCIONAR:');
console.log('━'.repeat(60));
console.log('1. Ve a: https://console.cloud.google.com/apis/credentials?project=tidy-strand-464419-u2');
console.log('2. Busca tu OAuth Client ID');
console.log('3. Click en EDITAR (ícono de lápiz)');
console.log('4. En "Authorized JavaScript origins" pon: http://localhost:3000');
console.log('5. En "Authorized redirect URIs" pon: http://localhost:3000/auth/google/callback');
console.log('6. GUARDAR cambios');
console.log('7. Esperar 2-3 minutos para que se propague');
console.log('8. Probar OAuth nuevamente');
console.log('━'.repeat(60));
console.log();

// Ejecutar test si el servidor está corriendo
testServer().then(() => {
    console.log('\n🎯 RESUMEN:');
    console.log('- Si el servidor está corriendo → configura las URLs en Google Cloud');
    console.log('- Si no está corriendo → ejecuta "npm run dev" primero');
    console.log('- Después de configurar → espera 2-3 minutos y prueba OAuth');
}).catch(err => {
    console.log('\n💡 Para probar: node verify-oauth-config.js');
});