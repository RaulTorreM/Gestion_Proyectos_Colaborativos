const supertest = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken, getUserIdFromToken } = require('../lib/token');


// Crear instancia de supertest
const request = supertest(app);


// Mocks
jest.mock('../models/User');
jest.mock('../models/RefreshToken');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

// Respuestas simuladas de las funciones en token.js
jest.mock('../lib/token', () => ({
    generateAccessToken: jest.fn(() => 'mockAccessToken'),
    generateRefreshToken: jest.fn(() => 'mockRefreshToken'),
    getUserIdFromToken: jest.fn(() => 'mockUserIdFromToken')
  }));

jest.mock('../middlewares/validateToken', () => ({
    validateToken: (req, res, next) => {
        // Simular usuario autenticado
        req.user = { id: 1, username: 'testuser' };
        next();
    }
}));

describe('API Tests', () => {
    describe('Public Routes', () => {
        // Probar Login
        describe('POST /api/login', () => {
            beforeEach(() => {
                // Limpiar todos los mocks antes de cada test
                jest.clearAllMocks();
            });
            
            // 1. Test para usuario no encontrado
            test('should return 404 when user is not found', async () => {
                // Preparar el entorno simulado (Arrange)
                User.findOne.mockResolvedValue(null); // Simular que no se encuentra el usuario
            
                // Enviar la solicitud (Act)
                const response = await request
                    .post('/api/login')
                    .send({
                        email: 'nonexistent@example.com',
                        password: 'testpassword'
                    });
            
                // Verificar los resultados y respuesta (Assert)
                expect(response.status).toBe(404);
                expect(response.body.error).toBe('Usuario no encontrado');
                expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
            });
            
            // 2. Test para credenciales incorrectas
            test('should return 400 when password is incorrect', async () => {
                // Preparar el entorno simulado (Arrange)
                const mockUser = {
                    _id: '123456',
                    email: 'test@example.com',
                    password: '$2b$10$hashfakepassword'
                };
            
                User.findOne.mockResolvedValue(mockUser);
                bcrypt.compare.mockResolvedValue(false); // Simular que la contraseña no coincide
            
                // Enviar la solicitud (Act)
                const response = await request
                    .post('/api/login')
                    .send({
                        email: 'test@example.com',
                        password: 'wrongpassword'
                    });
            
                // Verificar los resultados y respuesta (Assert)
                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Credenciales incorrectas');
                expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
            });
            
            // 3. Test para login exitoso
            test('should return 200 with tokens when login is successful', async () => {
                // Preparar el entorno simulado (Arrange)
                const mockUser = {
                    _id: '123456',
                    email: 'test@example.com',
                    password: '$2b$10$hashfakepassword'
                };
            
                User.findOne.mockResolvedValue(mockUser); // Simular que el usuario se encontró
                bcrypt.compare.mockResolvedValue(true); // Simular que la contraseña coincide
                RefreshToken.create.mockResolvedValue({}); // Simular creación exitosa del refresh token
            
                // Enviar la solicitud (Act)
                const response = await request
                    .post('/api/login')
                    .send({
                        email: 'test@example.com',
                        password: 'correctpassword'
                    });
            
                // Verificar los resultados y respuesta (Assert)
                expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
                expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', mockUser.password);
                expect(generateAccessToken).toHaveBeenCalledWith(mockUser);
                expect(generateRefreshToken).toHaveBeenCalledWith(mockUser);
                expect(RefreshToken.create).toHaveBeenCalledWith({
                    token: 'mockRefreshToken',
                    userId: mockUser._id
                });
                expect(response.status).toBe(200);
                /*
                    Cuando el código llama a generateAccessToken(user) y generateRefreshToken(user) durante el test,
                    se obtiene el valor simulado 'mockAccessToken' y 'mockRefreshToken'
                    en lugar de generar un token real.
                */
                expect(response.body).toEqual({
                    accessToken: 'mockAccessToken',
                    refreshToken: 'mockRefreshToken'
                });
            });
        });

        // Probar Refresh Token
        describe('POST /api/refresh-token', () => {
            beforeEach(() => {
              jest.clearAllMocks();
            });
          
            // 1. Test cuando no se envía refresh token
            test('should return 400 when refresh token is missing', async () => {
              const response = await request
                .post('/api/refresh-token')
                .send({});
              
              expect(response.status).toBe(400);
              expect(response.body.error).toBe('Refresh Token requerido');
              expect(RefreshToken.findOne).not.toHaveBeenCalled();
            });
          
            // 2. Test cuando el refresh token no existe en la BD
            test('should return 403 when refresh token is not found in database', async () => {
              RefreshToken.findOne.mockResolvedValue(null);
          
              const response = await request
                .post('/api/refresh-token')
                .send({ refreshToken: 'invalid_refresh_token' });
              
              expect(response.status).toBe(404);
              expect(response.body.error).toBe('Refresh Token inválido');
              expect(RefreshToken.findOne).toHaveBeenCalledWith({ token: 'invalid_refresh_token' });
            });
          
            // 3. Test cuando el refresh token es inválido/expirado
            test('should return 401 when refresh token is invalid or expired', async () => {
              RefreshToken.findOne.mockResolvedValue({ token: 'expired_token' });
              jwt.verify.mockImplementation(() => {
                throw new Error('Token expired');
              });
          
              const response = await request
                .post('/api/refresh-token')
                .send({ refreshToken: 'expired_token' });
              
              expect(response.status).toBe(401);
              expect(response.body.error).toBe('Refresh Token expirado o inválido');
            });
          
            // 4. Test para caso exitoso
            test('should return new access token when refresh token is valid', async () => {
              const mockTokenDoc = {
                token: 'valid_refresh_token',
                userId: 'user123'
              };
              const mockDecoded = { id: 'user123' };
              const mockNewAccessToken = 'new_access_token_123';
          
              RefreshToken.findOne.mockResolvedValue(mockTokenDoc);
              jwt.verify.mockReturnValue(mockDecoded);
              generateAccessToken.mockReturnValue(mockNewAccessToken);
          
              const response = await request
                .post('/api/refresh-token')
                .send({ refreshToken: 'valid_refresh_token' });
              
              expect(response.status).toBe(200);
              expect(response.body).toEqual({ accessToken: 'new_access_token_123' });
              expect(jwt.verify).toHaveBeenCalledWith(
                'valid_refresh_token',
                process.env.JWT_REFRESH_SECRET
              );
              expect(generateAccessToken).toHaveBeenCalledWith({ _id: 'user123' });
            });
          });
    });

    describe('Private Routes', () => {
        // Probar Logged User
        describe('POST /api/logged', () => {
            beforeEach(() => {
                // Limpiar todos los mocks antes de cada test
                jest.clearAllMocks();
            });
            
            // 1. Header Authorization no enviado
            test('should return 400 when Authorization header is missing', async () => {
                const response = await request
                    .get('/api/logged');
                    // No se establece el header Authorization

                console.log('Response body:', response.body);

                expect(response.status).toBe(400);
                // validateAuth.js
            });

            // 2. Access token es null
            test('should return 400 when Authorization header contains null', async () => {
                const response = await request
                    .get('/api/logged')
                    .set('Authorization', null);

                expect(response.status).toBe(400);
                // validateAuth.js
            });

            // 3. Access token es string vacío
            test('should return 400 when Authorization header is empty string', async () => {
                const response = await request
                    .get('/api/logged')
                    .set('Authorization', '');

                expect(response.status).toBe(400);
                // validateAuth.js
            });

            // 4. Access token inválido/Expirado
            test('should return 401 for invalid/expired token', async () => {
                jwt.verify.mockImplementation(() => {
                  throw new Error('Token expired');
                });
              
                const response = await request
                    .get('/api/logged')
                    .set('Authorization', 'invalid_token');
              
                expect(response.status).toBe(401);
                expect(response.body.error).toContain('Access Token expirado o inválido');
            });

            // 5. Access token válido pero usuario no encontrado
            test('should return 400 when user not found', async () => {
                // Mockear jwt.verify para devolver un payload
                jwt.verify.mockReturnValue({ id: 'non_existent_user' });
                
                // Mockear User.findById para devolver null
                User.findById.mockResolvedValue(null);
              
                const response = await request
                    .get('/api/logged')
                    .set('Authorization', 'valid_token_but_no_user');
              
                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Usuario con este Access token no encontrado');
                expect(User.findById).toHaveBeenCalledWith('non_existent_user');
            });

            // 6. Access token válido y usuario encontrado
            test('should return 200 with user data for valid token', async () => {
                const mockUser = {
                  _id: 'user123',
                  name: 'Test User',
                  email: 'test@example.com'
                };
              
                // Configurar mocks
                jwt.verify.mockReturnValue({ id: 'user123' });
                User.findById.mockResolvedValue(mockUser);
              
                const response = await request
                  .get('/api/logged')
                  .set('Authorization', 'valid_token');
              
                expect(response.status).toBe(200);
                expect(response.body).toEqual(mockUser);
                expect(jwt.verify).toHaveBeenCalledWith('valid_token', process.env.JWT_SECRET);
                expect(User.findById).toHaveBeenCalledWith('user123');
            });
        });

        // Probar Logout
        describe('POST /api/logout', () => {
            beforeEach(() => {
                // Limpiar todos los mocks antes de cada test
                jest.clearAllMocks();
            });
            
            // 1. Refresh token no enviado
            test('should return 400 when refresh token is missing', async () => {
                // Preparar el entorno simulado (Arrange)
                const emptyData = {};

                // Enviar la solicitud (Act)
                const response = await request
                    .post('/api/logout')
                    .send(emptyData);

                // Verificar los resultados y respuesta (Assert)
                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Refresh token requerido');
            });

            // 2. Refresh token enviado como null
            test('should return 400 when refresh token is null', async () => {
                // Preparar el entorno simulado (Arrange)
                const refreshTokenTest = null;

                // Enviar la solicitud (Act)
                const response = await request
                .post('/api/logout')
                .send({ refreshToken: refreshTokenTest });
            
                // Verificar los resultados y respuesta (Assert)
                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Refresh token requerido');
            });

            // 3. Refresh token enviado como string vacío
            test('should return 400 when refresh token is empty string', async () => {
                // Preparar el entorno simulado (Arrange)
                const refreshTokenTest = '';

                // Enviar la solicitud (Act)
                const response = await request
                .post('/api/logout')
                .send({ refreshToken: refreshTokenTest });
            
                // Verificar los resultados y respuesta (Assert)
                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Refresh token requerido');
            });
            
            // 4. Refresh token inexistente en la BD
            test('should return 404 when refresh token is not found ind database', async () => {
                // Preparar el entorno simulado (Arrange)
                const invalidToken = 'non_existent_refresh_token';

                RefreshToken.findOne.mockResolvedValue(null);
            
                // Enviar la solicitud (Act)
                const response = await request
                    .post('/api/logout')
                    .send({ refreshToken: invalidToken });
             
                // Verificar los resultados y respuesta (Assert)
                expect(RefreshToken.findOne).toHaveBeenCalledWith({ token: invalidToken });
                expect(response.status).toBe(404);
                expect(response.body.error).toBe('Refresh Token no encontrado');
            });

            // 5. Eliminación de un token existente en la BD
            test('should delete refresh token when valid token is provided', async () => {
                // Preparar el entorno simulado (Arrange)
                const validToken = 'valid_refresh_token';
                const mockTokenDoc = { 
                    _id: 'token_id_123',
                    token: validToken,
                    userId: 'user_id_456',
                    createdAt: new Date()
                };
                
                RefreshToken.findOne.mockResolvedValue(mockTokenDoc);
                RefreshToken.deleteOne.mockResolvedValue({ deletedCount: 1 });
            
                // Enviar la solicitud (Act)
                const response = await request
                    .post('/api/logout')
                    .send({ refreshToken: validToken });
            
                // Verificar los resultados y respuesta (Assert)
                expect(RefreshToken.findOne).toHaveBeenCalledWith({ token: validToken });
                expect(RefreshToken.deleteOne).toHaveBeenCalledWith({ _id: mockTokenDoc._id });
                expect(response.status).toBe(200);
                expect(response.body.error).toBe('Sesión cerrada correctamente');
            });
        });

        /* describe('Users API', () => {
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
        }); */
    });

    // Pruebas de middleware de autenticación
    /* describe('Authentication Middleware', () => {
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