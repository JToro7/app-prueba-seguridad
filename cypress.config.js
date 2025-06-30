const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Evitar problemas con redirecciones externas
    chromeWebSecurity: false,
    
    // Configuración de archivos
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    // Variables de entorno para tests
    env: {
      // Credenciales de prueba
      testUser: {
        email: 'demo@universidad.edu',
        password: 'Demo123!',
        role: 'student'
      },
      adminUser: {
        email: 'admin@universidad.edu',
        password: 'Admin123!',
        role: 'admin'
      },
      apiUrl: 'http://localhost:3000/api',
      // Configuración OAuth específica
      googleClientId: '357335219317-8b83h6uo1vbp27nrkk5t8v6g9s212tt4.apps.googleusercontent.com',
      projectId: 'tidy-strand-464419-u2'
    },
    
    setupNodeEvents(on, config) {
      // Eventos simplificados
      on('before:browser:launch', (browser = {}, launchOptions) => {
        console.log('🚀 Iniciando browser para tests OAuth:', browser.name);
        return launchOptions;
      });
      
      on('after:spec', (spec, results) => {
        console.log(`📋 Spec completado: ${spec.name} - Passed: ${results.stats.passes}, Failed: ${results.stats.failures}`);
      });
      
      return config;
    },
  },
});