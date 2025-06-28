// auth-client.js - Cliente de autenticación
class AuthClient {
  constructor() {
    this.token = localStorage.getItem('jwtToken');
    this.user = null;
  }

  async login(email, password) {
    try {
      const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        this.setToken(data.token);
        this.user = data.user;
        return { success: true };
      }

      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  }

  loginWithGoogle() {
    window.location.href = `${CONFIG.API_URL}/auth/google`;
  }

  async logout() {
    try {
      await fetch(`${CONFIG.API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error en logout:', error);
    }

    this.clearToken();
    this.user = null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('jwtToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('jwtToken');
  }

  isAuthenticated() {
    if (!this.token) return false;

    const decoded = this.decodeToken(this.token);
    if (!decoded) return false;

    // Verificar expiración
    if (decoded.exp < Date.now() / 1000) {
      this.clearToken();
      return false;
    }

    return true;
  }

  decodeToken(token) {
    try {
      const parts = token.split('.');
      return JSON.parse(atob(parts[1]));
    } catch (e) {
      return null;
    }
  }

  getUser() {
    if (!this.user && this.token) {
      const decoded = this.decodeToken(this.token);
      if (decoded) {
        this.user = {
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role
        };
      }
    }
    return this.user;
  }
}

const authClient = new AuthClient();