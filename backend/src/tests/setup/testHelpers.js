const supertest = require('supertest');
const app = require('../../app');

global.request = supertest(app);
