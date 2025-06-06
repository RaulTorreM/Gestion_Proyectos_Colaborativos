const supertest = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { generateAccessToken, generateRefreshToken } = require('../lib/token');

// Crear instancia de supertest
const request = supertest(app);


// Mocks
jest.mock('../models/User');
jest.mock('../models/RefreshToken');
jest.mock('bcrypt');
jest.mock('../lib/token', () => ({
    generateAccessToken: jest.fn(() => 'mockAccessToken'),
    generateRefreshToken: jest.fn(() => 'mockRefreshToken')
  }));
  
jest.mock('../middlewares/validateToken', () => ({
    validateToken: (req, res, next) => {
        // Simular usuario autenticado
        req.user = { id: 1, username: 'testuser' };
        next();
    }
}));

describe('API Tests', () => {
    // Probar Login
    describe('POST /api/login', () => {
        beforeEach(() => {
            // Limpiar todos los mocks antes de cada test
            jest.clearAllMocks();
        });
        
        // 1. Test para usuario no encontrado
        test('should return 404 when user is not found', async () => {
            User.findOne.mockResolvedValue(null); // Simular que no se encuentra el usuario
        
            const response = await request
            .post('/api/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'testpassword'
            });
        
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Usuario no encontrado');
            expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
        });
        
        // 2. Test para credenciales incorrectas
        test('should return 400 when password is incorrect', async () => {
            const mockUser = {
            _id: '123456',
            email: 'test@example.com',
            password: '$2b$10$hashfakepassword'
            };
        
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false); // Simular que la contraseña no coincide
        
            const response = await request
            .post('/api/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpassword'
            });
        
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Credenciales incorrectas');
            expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
        });
        
        // 3. Test para login exitoso
        test('should return 200 with tokens when login is successful', async () => {
            const mockUser = {
            _id: '123456',
            email: 'test@example.com',
            password: '$2b$10$hashfakepassword'
            };
        
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true); // Simular que la contraseña coincide
            RefreshToken.create.mockResolvedValue({}); // Simular creación exitosa del refresh token
        
            const response = await request
            .post('/api/login')
            .send({
                email: 'test@example.com',
                password: 'correctpassword'
            });
        
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                accessToken: 'mockAccessToken',
                refreshToken: 'mockRefreshToken'
            });
            
            // Verificar que se llamaron las funciones como se esperaba
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', mockUser.password);
            expect(generateAccessToken).toHaveBeenCalledWith(mockUser);
            expect(generateRefreshToken).toHaveBeenCalledWith(mockUser);
            expect(RefreshToken.create).toHaveBeenCalledWith({
                token: 'mockRefreshToken',
                userId: mockUser._id
            });
        });
    });

    /* // Pruebas para rutas protegidas
    describe('Protected Routes', () => {
        
        describe('Users API', () => {
            test('GET /api/users should return users list', async () => {
                const response = await request.get('/api/users');
                expect(response.status).toBeDefined();
            });

            test('POST /api/users should create a new user', async () => {
                const newUser = {
                    username: 'newuser',
                    email: 'test@example.com',
                    password: 'password123'
                };

                const response = await request
                    .post('/api/users')
                    .send(newUser);
                
                expect(response.status).toBeDefined();
            });
        });

        describe('Projects API', () => {
            test('GET /api/projects should return projects list', async () => {
                const response = await request.get('/api/projects');
                expect(response.status).toBeDefined();
            });

            test('POST /api/projects should create a new project', async () => {
                const newProject = {
                    name: 'Test Project',
                    description: 'A test project'
                };

                const response = await request
                    .post('/api/projects')
                    .send(newProject);
                
                expect(response.status).toBeDefined();
            });
        });

        describe('Epics API', () => {
            test('GET /api/epics should return epics list', async () => {
                const response = await request.get('/api/epics');
                expect(response.status).toBeDefined();
            });
        });

        describe('User Stories API', () => {
            test('GET /api/userStories should return user stories list', async () => {
                const response = await request.get('/api/userStories');
                expect(response.status).toBeDefined();
            });
        });

        describe('Comments API', () => {
            test('GET /api/comments should return comments list', async () => {
                const response = await request.get('/api/comments');
                expect(response.status).toBeDefined();
            });
        });

        describe('Priorities API', () => {
            test('GET /api/priorities should return priorities list', async () => {
                const response = await request.get('/api/priorities');
                expect(response.status).toBeDefined();
            });
        });

        describe('Versions API', () => {
            test('GET /api/versions should return versions list', async () => {
                const response = await request.get('/api/versions');
                expect(response.status).toBeDefined();
            });
        });

        describe('Chat API', () => {
            test('GET /api/chat should return chat data', async () => {
                const response = await request.get('/api/chat');
                expect(response.status).toBeDefined();
            });
        });
    });

    // Pruebas para rutas públicas
    describe('Notifications API', () => {
        test('GET /api/notifications should return notifications', async () => {
            const response = await request.get('/api/notifications');
            expect(response.status).toBeDefined();
        });
    });

    // Pruebas de middleware de autenticación
    describe('Authentication Middleware', () => {
        // Temporalmente deshabilitar el mock para probar autenticación real
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should reject requests without token on protected routes', async () => {
            // Necesitarías deshabilitar el mock temporalmente para esta prueba
            // o crear una versión sin mock del middleware
        });
    }); */
});