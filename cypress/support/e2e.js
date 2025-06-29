// cypress/support/e2e.js - Configuración E2E
import './commands';

// Configuración global
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignorar errores de aplicaciones de terceros
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  return true;
});

// Screenshot en caso de fallo
Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    cy.screenshot(`${test.parent.title} - ${test.title} - ${timestamp}`);
  }
});

// Configuración de viewport por defecto
beforeEach(() => {
  cy.viewport(1280, 720);
});