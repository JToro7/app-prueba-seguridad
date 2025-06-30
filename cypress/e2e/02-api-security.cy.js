describe('Seguridad de API y Rutas Protegidas', () => {
  
  describe('Endpoints Públicos', () => {
    it('debe permitir acceso a endpoint de información', () => {
      cy.request('/api/info').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body.data).to.have.property('appName');
        expect(response.body.data).to.have.property('features');
      });
    });
  });

  describe('Rutas Protegidas - Sin Autenticación', () => {
    it('debe denegar acceso a /api/profile sin token', () => {
      cy.verifyProtectedRoute('/api/profile');
    });

    it('debe denegar acceso a /api/settings sin token', () => {
      cy.verifyProtectedRoute('/api/settings');
    });

    it('debe denegar acceso a /api/admin sin token', () => {
      cy.verifyProtectedRoute('/api/admin');
    });

    it('debe denegar acceso a /api/admin/stats sin token', () => {
      cy.verifyProtectedRoute('/api/admin/stats');
    });

    it('debe denegar acceso a /api/admin/users sin token', () => {
      cy.verifyProtectedRoute('/api/admin/users');
    });
  });

  describe('Rutas Protegidas - Con Autenticación de Estudiante', () => {
    beforeEach(() => {
      cy.loginViaAPI('student');
    });

    it('debe permitir acceso a /api/profile', () => {
      cy.authenticatedRequest('GET', '/api/profile').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body.data).to.have.property('email', 'demo@universidad.edu');
        expect(response.body.data).to.have.property('role', 'student');
        expect(response.body.data).to.have.property('matricula');
        expect(response.body.data).to.have.property('carrera');
      });
    });

    it('debe permitir acceso a /api/settings', () => {
      cy.authenticatedRequest('GET', '/api/settings').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body.data).to.have.property('notifications');
        expect(response.body.data).to.have.property('theme');
        expect(response.body.data).to.have.property('language');
      });
    });

    it('debe denegar acceso a rutas de admin', () => {
      cy.authenticatedRequest('GET', '/api/admin').then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body).to.have.property('error', 'Acceso denegado');
      });
    });

    it('debe denegar acceso a estadísticas de admin', () => {
      cy.request({
        method: 'GET',
        url: '/api/admin/stats',
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('jwtToken')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });
  });

  describe('Rutas Protegidas - Con Autenticación de Admin', () => {
    beforeEach(() => {
      cy.loginViaAPI('admin');
    });

    it('debe permitir acceso a /api/profile', () => {
      cy.authenticatedRequest('GET', '/api/profile').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.property('email', 'admin@universidad.edu');
        expect(response.body.data).to.have.property('role', 'admin');
        expect(response.body.data).to.have.property('departamento');
      });
    });

    it('debe permitir acceso a /api/admin', () => {
      cy.authenticatedRequest('GET', '/api/admin').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body.data).to.have.property('activeUsers');
        expect(response.body.data).to.have.property('newRegistrationsToday');
        expect(response.body.data).to.have.property('systemHealth');
      });
    });

    it('debe permitir acceso a /api/admin/stats', () => {
      cy.authenticatedRequest('GET', '/api/admin/stats').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.property('usersByRole');
        expect(response.body.data).to.have.property('monthlyGrowth');
        expect(response.body.data).to.have.property('topCourses');
      });
    });

    it('debe permitir acceso a /api/admin/users', () => {
      cy.authenticatedRequest('GET', '/api/admin/users').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.be.an('array');
        // Verificar que no se devuelven passwords
        response.body.data.forEach(user => {
          expect(user).to.not.have.property('password');
          expect(user).to.have.property('email');
          expect(user).to.have.property('role');
        });
      });
    });
  });

  describe('Validación de Tokens JWT', () => {
    it('debe rechazar tokens malformados', () => {
      cy.request({
        method: 'GET',
        url: '/api/profile',
        headers: {
          'Authorization': 'Bearer token-malformado'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(403);
        expect(response.body).to.have.property('error', 'Token inválido');
      });
    });

    it('debe rechazar tokens sin Bearer prefix', () => {
      cy.request({
        method: 'GET',
        url: '/api/profile',
        headers: {
          'Authorization': 'token-sin-bearer'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('debe validar token correctamente con endpoint verify', () => {
      cy.loginViaAPI('student');
      
      cy.authenticatedRequest('POST', '/api/auth/verify').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('user');
        expect(response.body.user).to.have.property('email', 'demo@universidad.edu');
      });
    });
  });

  describe('Actualización de Configuración', () => {
    beforeEach(() => {
      cy.loginViaAPI('student');
    });

    it('debe permitir actualizar configuración de usuario', () => {
      const newSettings = {
        notifications: false,
        theme: 'dark',
        language: 'en',
        twoFactorAuth: true
      };

      cy.authenticatedRequest('PUT', '/api/settings', newSettings).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body.data).to.include(newSettings);
      });
    });
  });

  describe('Manejo de Errores de API', () => {
    it('debe retornar 404 para rutas inexistentes', () => {
      cy.request({
        method: 'GET',
        url: '/api/inexistente',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error', 'Ruta no encontrada');
      });
    });

    it('debe manejar métodos HTTP no permitidos', () => {
      cy.request({
        method: 'DELETE',
        url: '/api/profile',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });
});