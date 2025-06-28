class App {
  constructor() {
    this.container = document.getElementById('app');
    this.init();
  }

  init() {
    // Verificar token en URL (OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      authClient.setToken(token);
      window.history.replaceState({}, document.title, '/');
    }

    // Verificar autenticación
    if (authClient.isAuthenticated()) {
      this.showDashboard();
    } else {
      this.showLogin();
    }
  }

  showLogin() {
    this.container.innerHTML = `
      <div class="container">
        <div class="header">
          <h1>🔐 ${CONFIG.APP_NAME}</h1>
          <p>Implementación de OAuth 2.0 y JWT</p>
        </div>
        <div id="loginView">
          ${Components.loginForm()}
        </div>
      </div>
    `;

    this.attachLoginEvents();
  }

  showDashboard() {
    const user = authClient.getUser();
    
    this.container.innerHTML = `
      <div class="container">
        <div class="header">
          <h1>🔐 ${CONFIG.APP_NAME}</h1>
          <p>Panel de Control</p>
        </div>
        ${Components.dashboard(user)}
      </div>
    `;
  }

  attachLoginEvents() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const result = await authClient.login(email, password);
      
      if (result.success) {
        this.showAlert('¡Inicio de sesión exitoso!', 'success');
        setTimeout(() => this.showDashboard(), 1000);
      } else {
        this.showAlert(result.error || 'Error al iniciar sesión', 'error');
      }
    });
  }

  async fetchProtectedData(endpoint) {
    try {
      const data = await apiClient.get(endpoint);
      
      const content = document.getElementById('protectedContent');
      content.style.display = 'block';
      content.innerHTML = `
        <h4>Respuesta de ${endpoint}</h4>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `;
      
      this.showAlert(`Datos obtenidos de ${endpoint}`, 'success');
    } catch (error) {
      this.showAlert('Error al obtener datos', 'error');
    }
  }

  async logout() {
    await authClient.logout();
    this.showAlert('Sesión cerrada exitosamente', 'success');
    setTimeout(() => this.showLogin(), 1000);
  }

  showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer') || 
      this.createAlertContainer();
    
    alertContainer.innerHTML = Components.alert(message, type);
    
    setTimeout(() => {
      alertContainer.innerHTML = '';
    }, 5000);
  }

  createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alertContainer';
    document.querySelector('.dashboard, #loginView').prepend(container);
    return container;
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});