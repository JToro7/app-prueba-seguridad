describe('Autenticación y Seguridad', () => {
  
  beforeEach(() => {
    cy.visit('/');
    cy.waitForApp();
  });

  describe('Interfaz de Login', () => {
    it('debe mostrar la página de login correctamente', () => {
      // Verificar elementos principales
      cy.contains('Aplicación Web Segura').should('be.visible');
      cy.contains('Iniciar Sesión').should('be.visible');
      cy.get('#email').should('be.visible');
      cy.get('#password').should('be.visible');
      cy.get('#loginForm button[type="submit"]').should('be.visible');
      
      // Verificar características de seguridad (sin tokenDisplay)
      cy.verifySecurityElements();
    });

    it('debe mostrar estado del servidor', () => {
      cy.get('#serverStatus').should('be.visible');
      cy.get('#serverStatusText').should('contain.text', 'Servidor conectado');
    });

    it('debe mostrar credenciales de prueba', () => {
      cy.contains('demo@universidad.edu').should('be.visible');
      cy.contains('admin@universidad.edu').should('be.visible');
      cy.contains('Demo123!').should('be.visible');
      cy.contains('Admin123!').should('be.visible');
    });
  });

  describe('Login con Credenciales', () => {
    it('debe permitir login exitoso con credenciales de estudiante', () => {
      cy.intercept('POST', '/api/auth/login').as('loginRequest');
      
      cy.get('#email').type('demo@universidad.edu');
      cy.get('#password').type('Demo123!');
      cy.get('#loginForm').submit();
      
      cy.wait('@loginRequest').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
      });
      
      // Verificar que se muestra el dashboard
      cy.get('#dashboardView').should('be.visible');
      cy.get('#loginView').should('not.be.visible');
      
      // Verificar información del usuario
      cy.get('#userEmail').should('contain.text', 'demo@universidad.edu');
      cy.get('#userRole').should('contain.text', 'student');
      cy.get('#tokenDisplay').should('not.be.empty');
      
      // Verificar alerta de éxito
      cy.verifyAlert('success', 'Inicio de sesión exitoso');
    });

    it('debe permitir login exitoso con credenciales de admin', () => {
      cy.login('admin');
      
      cy.get('#userEmail').should('contain.text', 'admin@universidad.edu');
      cy.get('#userRole').should('contain.text', 'admin');
    });

    it('debe rechazar credenciales incorrectas', () => {
      cy.intercept('POST', '/api/auth/login').as('loginRequest');
      
      cy.get('#email').type('wrong@email.com');
      cy.get('#password').type('wrongpassword');
      cy.get('#loginForm').submit();
      
      cy.wait('@loginRequest').then((interception) => {
        expect(interception.response.statusCode).to.eq(401);
      });
      
      // Debe permanecer en la página de login
      cy.get('#loginView').should('be.visible');
      cy.get('#dashboardView').should('not.be.visible');
      
      // Verificar mensaje de error
      cy.verifyAlert('error');
    });

    it('debe validar campos requeridos', () => {
      // Intentar enviar formulario vacío
      cy.get('#loginForm').submit();
      
      // El formulario no debe enviarse (validación HTML5)
      cy.get('#loginView').should('be.visible');
      
      // Verificar validación de email
      cy.get('#email').type('invalid-email');
      cy.get('#password').type('somepassword');
      cy.get('#loginForm').submit();
      
      cy.get('#loginView').should('be.visible');
    });

    it('debe mostrar loading durante el login', () => {
      // Interceptar con delay usando sintaxis correcta
      cy.intercept('POST', '/api/auth/login', {
        delay: 1000,
        statusCode: 200,
        body: {
          success: true,
          message: 'Login exitoso',
          token: 'mock-token-for-testing',
          user: {
            id: 1,
            email: 'demo@universidad.edu',
            role: 'student',
            name: 'Juan Pérez',
            provider: 'local'
          }
        }
      }).as('slowLogin');
      
      cy.get('#email').type('demo@universidad.edu');
      cy.get('#password').type('Demo123!');
      cy.get('#loginForm').submit();
      
      // Verificar estado de loading
      cy.get('#loginBtn').should('be.disabled');
      cy.get('#loginLoader').should('be.visible');
      cy.get('#loginBtnText').should('not.be.visible');
      
      // Esperar a que termine
      cy.wait('@slowLogin');
      cy.get('#dashboardView').should('be.visible');
    });
  });

  describe('OAuth con Google - Testing', () => {
    it('debe mostrar botón OAuth Real', () => {
      cy.verifyOAuthButton();
    });

    it('debe verificar configuración OAuth en el backend', () => {
      // Verificar que OAuth está configurado en el servidor
      cy.request('/api/auth/config').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.providers.google).to.be.true;
        expect(response.body.data.oauth.google.client_id).to.include('357335219317');
      });
    });

    it('debe verificar que OAuth redirige (sin seguir la redirección)', () => {
      // Interceptar la redirección para que NO vaya a Google
      cy.request({
        method: 'GET',
        url: '/auth/google',
        followRedirect: false
      }).then((response) => {
        // Debe ser redirección (302) a Google
        expect(response.status).to.eq(302);
        expect(response.headers.location).to.include('accounts.google.com');
        expect(response.headers.location).to.include('oauth2');
      });
    });

    it('debe procesar simulación de OAuth exitoso', () => {
      // NO usar token simulado - usar login normal y cambiar provider
      cy.login('student');
      
      // Verificar que el dashboard se muestra
      cy.get('#dashboardView').should('be.visible');
      cy.get('#userEmail').should('contain.text', 'demo@universidad.edu');
      cy.get('#userRole').should('contain.text', 'student');
      
      // Simular que el usuario vino de OAuth (cambiar texto visualmente)
      cy.window().then((win) => {
        // Cambiar el proveedor mostrado para simular OAuth
        const providerSpan = win.document.querySelector('#userProvider');
        if (providerSpan) {
          providerSpan.textContent = 'google';
        }
      });
    });

    it('debe manejar errores OAuth', () => {
      cy.visit('/?error=oauth_failed');
      
      cy.get('#loginView').should('be.visible');
      cy.verifyAlert('error', 'Falló la autenticación con Google');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      cy.login('student');
    });

    it('debe permitir logout exitoso', () => {
      cy.logout();
      
      // Verificar que regresa al login
      cy.get('#loginView').should('be.visible');
      cy.get('#dashboardView').should('not.be.visible');
      
      // Verificar que el formulario está limpio
      cy.get('#email').should('have.value', '');
      cy.get('#password').should('have.value', '');
      
      // Verificar mensaje de éxito
      cy.verifyAlert('success', 'Sesión cerrada exitosamente');
    });

    it('debe limpiar token del localStorage al hacer logout', () => {
      cy.window().then((win) => {
        expect(win.localStorage.getItem('jwtToken')).to.not.be.null;
      });
      
      cy.logout();
      
      cy.window().then((win) => {
        expect(win.localStorage.getItem('jwtToken')).to.be.null;
      });
    });
  });

  describe('Persistencia de Sesión', () => {
    it('debe mantener la sesión al recargar la página', () => {
      cy.login('student');
      
      // Recargar página
      cy.reload();
      
      // Debe seguir en el dashboard
      cy.get('#dashboardView').should('be.visible');
      cy.get('#userEmail').should('contain.text', 'demo@universidad.edu');
    });

    it('debe redirigir al login si no hay token válido', () => {
      cy.visit('/');
      
      // Sin token válido, debe mostrar login
      cy.get('#loginView').should('be.visible');
      cy.get('#dashboardView').should('not.be.visible');
    });
  });
});