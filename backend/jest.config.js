module.exports = {
	// Indicarle a Jest dónde está el setup global antes de los tests
	globalSetup: './src/tests/setup/globalSetup.js',
  
	// Cargar helpers después de que Jest configure el entorno
	setupFilesAfterEnv: ['./src/tests/setup/mocks/index.js', './src/tests/setup/testHelpers.js'],
  
	moduleNameMapper: {
		'^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
	},
	  
	// Extensiones válidas de test
	testMatch: [
	  '**/tests/**/*.test.js'
	],
  
	// Directorios que Jest debe ignorar
	testPathIgnorePatterns: [
	  '/node_modules/'
	],
  
	// Simular entorno de node
	testEnvironment: 'node',
  
	// Clear mocks entre pruebas
	clearMocks: true
};
