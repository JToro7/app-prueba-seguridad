const { spawn } = require('child_process');
const fs = require('fs');

console.log('🧪 PREPARANDO TESTS OAUTH CORREGIDOS\n');

// Verificar que el servidor esté corriendo
const checkServer = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/info');
        if (response.ok) {
            console.log('✅ Servidor detectado en puerto 3000');
            return true;
        }
    } catch (error) {
        console.log('❌ Servidor no detectado en puerto 3000');
        console.log('   Ejecuta: npm run dev');
        return false;
    }
};

// Verificar archivos corregidos
const checkFiles = () => {
    const files = [
        'cypress/support/e2e.js',
        'cypress/support/commands.js',
        'cypress/e2e/05-oauth-google-real-fixed.cy.js',
        'cypress.config.js'
    ];
    
    console.log('📁 Verificando archivos de Cypress...');
    
    files.forEach(file => {
        const exists = fs.existsSync(file);
        console.log(`${exists ? '✅' : '❌'} ${file}`);
    });
    
    console.log();
};

// Ejecutar tests
const runTests = () => {
    console.log('🚀 Ejecutando tests OAuth corregidos...\n');
    
    const cypress = spawn('npx', ['cypress', 'open'], {
        stdio: 'inherit',
        shell: true
    });
    
    cypress.on('close', (code) => {
        console.log(`\n📋 Tests terminados con código: ${code}`);
        
        if (code === 0) {
            console.log('✅ ¡Todos los tests pasaron!');
        } else {
            console.log('⚠️ Algunos tests fallaron');
        }
    });
    
    cypress.on('error', (error) => {
        console.error('❌ Error ejecutando Cypress:', error);
    });
};

// Función principal
const main = async () => {
    checkFiles();
    
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        console.log('\n💡 INSTRUCCIONES:');
        console.log('1. Abre otra terminal');
        console.log('2. Ejecuta: npm run dev');
        console.log('3. Espera a que aparezca "Servidor OAuth iniciado"');
        console.log('4. Vuelve a ejecutar este script');
        return;
    }
    
    console.log('🎯 CONFIGURACIÓN DE TESTS:');
    console.log('- Tests corregidos sin cy.task');
    console.log('- Comandos Cypress simplificados');
    console.log('- Verificación OAuth real con tus credenciales');
    console.log('- Support file sin funciones problemáticas\n');
    
    runTests();
};

// Ejecutar
main();