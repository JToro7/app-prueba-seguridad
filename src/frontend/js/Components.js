// components.js - Componentes UI
const Components = {
  loginForm: () => `
    <div class="auth-container">
      <div class="auth-section login-section">
        <h2>Iniciar Sesión</h2>
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" required placeholder="usuario@ejemplo.com">
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" required placeholder="••••••••">
          </div>
          <button type="submit" class="btn">Iniciar Sesión con JWT</button>
        </form>
        
        <div style="margin: 20px 0; text-align: center; color: #718096;">
          — O —
        </div>
        
        <button class="btn btn-oauth" onclick="authClient.loginWithGoogle()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <!-- SVG de Google -->
          </svg>
          Iniciar con Google OAuth
        </button>
      </div>
      
      <div class="auth-section info-section">
        <h2>🛡️ Características de Seguridad</h2>
        <ul style="color: #4a5568; line-height: 1.8;">
          <li>✅ Autenticación con OAuth 2.0</li>
          <li>✅ Tokens JWT para sesiones seguras</li>
          <li>✅ Rutas protegidas con middleware</li>
          <li>✅ Validación de tokens</li>
        </ul>
      </div>
    </div>
  `,

  dashboard: (user) => `
    <div class="dashboard">
      <div id="alertContainer"></div>
      
      <div class="user-info">
        <h2>👤 Información del Usuario</h2>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>ID:</strong> ${user.id}</p>
        <p><strong>Rol:</strong> ${user.role}</p>
      </div>

      <h3>🔒 Rutas Protegidas</h3>
      <div class="secure-routes">
        ${Components.routeCard('Perfil', '/profile', 'API de Perfil')}
        ${Components.routeCard('Configuración', '/settings', 'API de Configuración')}
        ${Components.routeCard('Admin', '/admin/dashboard', 'Panel Admin')}
      </div>

      <div id="protectedContent" class="protected-content"></div>

      <button class="btn" style="background: #e53e3e;" onclick="app.logout()">
        Cerrar Sesión
      </button>
    </div>
  `,

  routeCard: (title, endpoint, description) => `
    <div class="route-card">
      <h4>${title}</h4>
      <p>${description}</p>
      <button class="btn" onclick="app.fetchProtectedData('${endpoint}')">
        Acceder
      </button>
    </div>
  `,

  alert: (message, type) => `
    <div class="alert alert-${type}">
      ${message}
    </div>
  `
};