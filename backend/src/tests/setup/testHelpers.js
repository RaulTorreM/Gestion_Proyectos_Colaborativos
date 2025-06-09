const supertest = require('supertest');
const app = require('../../app');

// Supertest disponible globalmente
global.request = supertest(app);
