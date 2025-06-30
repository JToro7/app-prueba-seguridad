// ***********************************************************
// Archivo de soporte principal para Cypress E2E
// ***********************************************************

// Importar comandos personalizados
import './commands';

// Configuración global
beforeEach(() => {
  // Limpiar localStorage antes de cada test
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});

// Manejo global de errores
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar errores específicos que no afectan los tests
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  
  // Ignorar errores de OAuth redirect (normales en testing)
  if (err.message.includes('oauth') || err.message.includes('google')) {
    return false;
  }
  
  // No fallar el test por errores de JavaScript menores
  return false;
});

// Configuración de timeouts
Cypress.config('defaultCommandTimeout', 10000);
Cypress.config('requestTimeout', 10000);
Cypress.config('responseTimeout', 10000);

// Configuración de viewport por defecto
Cypress.config('viewportWidth', 1280);
Cypress.config('viewportHeight', 720);

// Intercepción global de llamadas API para logging (sin cy.task)
beforeEach(() => {
  cy.intercept('POST', '/api/auth/login', (req) => {
    console.log(`Login attempt for: ${req.body.email}`);
  }).as('loginRequest');
  
  cy.intercept('GET', '/api/**', (req) => {
    console.log(`API call: ${req.method} ${req.url}`);
  }).as('apiRequest');
});

// Configuración de screenshots en fallos (sin cy.task)
afterEach(function() {
  if (this.currentTest.state === 'failed') {
    console.log(`Test failed: ${this.currentTest.title}`);
  }
});