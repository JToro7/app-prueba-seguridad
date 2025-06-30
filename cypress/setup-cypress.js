const fs = require('fs');
const path = require('path');

// Crear estructura de carpetas para Cypress
const createCypressStructure = () => {
  const directories = [
    'cypress',
    'cypress/e2e',
    'cypress/fixtures',
    'cypress/support',
    'cypress/screenshots',
    'cypress/videos'
  ];

  directories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Creada carpeta: ${dir}`);
    } else {
      console.log(`📁 Ya existe: ${dir}`);
    }
  });
};

// Crear archivos de configuración si no existen
const createConfigFiles = () => {
  const configFiles = [
    {
      path: 'cypress/fixtures/login-success.json',
      content: JSON.stringify({
        "success": true,
        "message": "Login exitoso",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token",
        "user": {
          "id": 1,
          "email": "demo@universidad.edu",
          "role": "student",
          "name": "Juan Pérez"
        }
      }, null, 2)
    },
    {
      path: 'cypress/fixtures/profile-response.json',
      content: JSON.stringify({
        "success": true,
        "data": {
          "id": 1,
          "email": "demo@universidad.edu",
          "name": "Juan Pérez",
          "role": "student",
          "matricula": "2021-001234",
          "carrera": "Ingeniería en Sistemas",
          "semestre": "8vo"
        }
      }, null, 2)
    }
  ];

  configFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file.path);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, file.content);
      console.log(`✅ Creado archivo: ${file.path}`);
    } else {
      console.log(`📄 Ya existe: ${file.path}`);
    }
  });
};

// Verificar que el servidor esté configurado
const checkServerSetup = () => {
  const serverPath = path.join(process.cwd(), 'src/backend/server.js');
  const frontendPath = path.join(process.cwd(), 'src/frontend/index.html');
  
  console.log('\n🔍 Verificando configuración...');
  
  if (fs.existsSync(serverPath)) {
    console.log('✅ Servidor backend encontrado');
  } else {
    console.log('❌ Servidor backend NO encontrado en src/backend/server.js');
  }
  
  if (fs.existsSync(frontendPath)) {
    console.log('✅ Frontend encontrado');
  } else {
    console.log('❌ Frontend NO encontrado en src/frontend/index.html');
    console.log('   💡 Asegúrate de guardar el HTML en src/frontend/index.html');
  }
};

// Mostrar instrucciones de uso
const showInstructions = () => {
  console.log('\n📋 INSTRUCCIONES PARA EJECUTAR CYPRESS:');
  console.log('═══════════════════════════════════════\n');
  
  console.log('1️⃣  Instalar dependencias:');
  console.log('   npm install\n');
  
  console.log('2️⃣  Asegúrate de que el servidor esté corriendo:');
  console.log('   npm run dev\n');
  
  console.log('3️⃣  Ejecutar tests de Cypress:');
  console.log('   🖥️  Modo interactivo (recomendado para desarrollo):');
  console.log('       npm run cypress:open');
  console.log('   o:  npm run test:e2e:open\n');
  
  console.log('   🤖 Modo headless (para CI/CD):');
  console.log('       npm run cypress:run');
  console.log('   o:  npm run test:e2e\n');
  
  console.log('4️⃣  Tests disponibles:');
  console.log('   📁 cypress/e2e/01-authentication.cy.js - Tests de autenticación');
  console.log('   📁 cypress/e2e/02-api-security.cy.js - Tests de seguridad API');
  console.log('   📁 cypress/e2e/03-user-interface.cy.js - Tests de interfaz\n');
  
  console.log('💡 CONSEJOS:');
  console.log('   • Usa cypress:open para ver los tests ejecutándose');
  console.log('   • Los videos se guardan en cypress/videos/');
  console.log('   • Los screenshots en cypress/screenshots/');
  console.log('   • Verifica que http://localhost:3000 esté accesible\n');
  
  console.log('🔧 ESTRUCTURA DE ARCHIVOS ESPERADA:');
  console.log('   app-prueba-seguridad/');
  console.log('   ├── src/');
  console.log('   │   ├── backend/server.js');
  console.log('   │   └── frontend/index.html');
  console.log('   ├── cypress/');
  console.log('   │   ├── e2e/');
  console.log('   │   ├── fixtures/');
  console.log('   │   └── support/');
  console.log('   ├── cypress.config.js');
  console.log('   └── package.json\n');
};

// Ejecutar configuración
console.log('🚀 Configurando Cypress para tu aplicación de seguridad...\n');

createCypressStructure();
createConfigFiles();
checkServerSetup();
showInstructions();

console.log('✨ ¡Configuración completa! Cypress está listo para usar.\n');