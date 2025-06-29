// Configuración global para Jest
require('dotenv').config({ path: '.env.test' });

// Mock de localStorage para pruebas
global.localStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value.toString();
  },
  removeItem: function(key) {
    delete this.data[key];
  },
  clear: function() {
    this.data = {};
  }
};

// Mock de fetch
global.fetch = jest.fn();

// Limpiar después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});