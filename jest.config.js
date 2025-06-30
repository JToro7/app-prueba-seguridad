module.exports = {
  // Entorno de test
  testEnvironment: 'node',
  
  // Patrones de archivos de test
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
    '**/?(*.)(spec|test).js'
  ],
  
  // Directorios a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/cypress/',
    '/build/',
    '/dist/'
  ],
  
  // Configuración de cobertura
  collectCoverage: true,
  collectCoverageFrom: [
    'src/backend/**/*.js',
    '!src/backend/server.js', // Excluir servidor principal
    '!src/backend/config/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Setup antes de ejecutar tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Timeout para tests (útil para tests de integración)
  testTimeout: 10000,
  
  // Variables de entorno para tests
  setupFiles: ['<rootDir>/jest.env.js'],
  
  // Transformaciones de archivos
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Módulos a mockear
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Configuración adicional
  verbose: true,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true
};