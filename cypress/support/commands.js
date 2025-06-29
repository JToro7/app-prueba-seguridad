
// Comando para login rápido
Cypress.Commands.add('login', (email = 'demo@universidad.edu', password = 'Demo123!') => {
  cy.visit('/');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('#loginForm').submit();
  cy.get('#dashboardView').should('be.visible');
});

// Comando para verificar token JWT
Cypress.Commands.add('checkJWT', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('jwtToken');
    expect(token).to.not.be.null;
    
    // Decodificar y verificar estructura
    const parts = token.split('.');
    expect(parts).to.have.length(3);
    
    const payload = JSON.parse(atob(parts[1]));
    expect(payload).to.have.property('sub');
    expect(payload).to.have.property('email');
    expect(payload).to.have.property('exp');
  });
});

// Comando para limpiar sesión
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('jwtToken');
  });
  cy.reload();
});

// Interceptor para simular respuestas de API
Cypress.Commands.add('mockAPI', () => {
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: {
      success: true,
      token: 'mock.jwt.token',
      user: {
        id: '12345',
        email: 'test@test.com',
        role: 'student'
      }
    }
  }).as('login');

  cy.intercept('GET', '/api/profile', {
    statusCode: 200,
    body: {
      user: {
        id: '12345',
        email: 'test@test.com',
        name: 'Test User',
        role: 'student'
      }
    }
  }).as('getProfile');
});