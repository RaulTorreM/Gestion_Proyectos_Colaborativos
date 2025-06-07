// Primero los mocks antes de cualquier importación (se llaman automáticamente en los tests)
jest.mock('../models/User');
jest.mock('../models/RefreshToken');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

jest.mock('../middlewares/validateToken', () => ({
    validateToken: jest.fn((req, res, next) => {
        const accessToken = req.headers.authorization;
        
        if (!accessToken || accessToken === 'null' || accessToken === '') {
            return res.status(400).json({ error: 'Access token requerido' });
        }
        
        if (accessToken === 'invalid_token' || accessToken === 'invalid-token' || accessToken === 'expired_token') {
            return res.status(401).json({ error: 'Access Token inválido o expirado' });
        }
        
        // Para casos especiales de test
        if (accessToken === 'valid_token_but_no_user') {
            req.userId = 'non_existent_user';
            return next();
        }
        
        if (accessToken === 'valid_token') {
            req.userId = 'user123';
            return next();
        }
        
        // Simular token válido por defecto
        req.userId = 'mockUserId';
        next();
    })
}));

jest.mock('../lib/token', () => ({
    generateAccessToken: jest.fn(() => 'mockAccessToken'),
    generateRefreshToken: jest.fn(() => 'mockRefreshToken'),
    getUserIdFromToken: jest.fn(() => 'mockUserIdFromToken')
}));

jest.mock('../middlewares/validateObjectId', () => {
    return jest.fn((model) => {
        return jest.fn((req, res, next) => {
            const { id } = req.params;
            
            // Casos específicos para testing
            if (id === 'invalid_object_id_format') {
                return res.status(400).json({ error: 'Invalid ID.' });
            }
            
            if (id === 'non_existent_id') {
                return res.status(404).json({ error: `${model.modelName || 'Document'} not found.` });
            }
            
            if (id === 'server_error_id') {
                return res.status(500).json({ error: 'Server error during validation.' });
            }
            
            // Para IDs válidos, continuar con el siguiente middleware
            next();
        });
    });
});

jest.mock('../middlewares/validateResult', () => jest.fn((req, res, next) => {
    if (req.testForceValidationError) {
      return res.status(400).json({ errors: [{ msg: 'Forced validation error' }] });
    }
    next();
}));

jest.mock('../models/User', () => {
    const mockUser = {
      _id: 'mockUserId',
      name: 'Mock User',
      email: 'mock@user.com',
      save: jest.fn().mockResolvedValue(true),
      toObject: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis()
    };
  
    return {
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      create: jest.fn().mockResolvedValue(mockUser),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      // Add constructor simulation if needed
      prototype: {
        save: jest.fn().mockResolvedValue(mockUser)
      }
    };
});

jest.mock('../middlewares/validateUser', () => ({
    validateCreateUser: [jest.fn((req, res, next) => {
        // Check if test wants to force validation error
        if (req.testForceValidationError) {
            const error = new Error('Mocked validation error');
            error.statusCode = 400;
            return next(error);
        }
        // Otherwise, pass through successfully
        next();
    })],
    validateUpdateUser: [jest.fn((req, res, next) => {
        // Check if test wants to force validation error
        if (req.testForceValidationError) {
            const error = new Error('Mocked validation error');
            error.statusCode = 400;
            return next(error);
        }
        // Otherwise, pass through successfully
        next();
    })]
}));
  
jest.mock('../models/Project', () => ({
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn()
}));

jest.mock('../middlewares/validateProject', () => ({
    validateCreateProject: [jest.fn((req, res, next) => {
        if (req.testForceValidationError) {
            const error = new Error('Mocked validation error');
            error.statusCode = 400;
            return next(error);
        }
        next();
    })],
    validateUpdateProject: [jest.fn((req, res, next) => {
        if (req.testForceValidationError) {
            const error = new Error('Mocked validation error');
            error.statusCode = 400;
            return next(error);
        }
        next();
    })],
    validateDeleteProject: [jest.fn((req, res, next) => {
        if (req.testForceValidationError) {
            const error = new Error('Mocked validation error');
            error.statusCode = 400;
            return next(error);
        }
        next();
    })]
}));
  
  
// Ahora sí importar las dependencias
const supertest = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');    
const { generateAccessToken, generateRefreshToken } = require('../lib/token');

// Crear instancia de supertest
const request = supertest(app);

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
        describe('GET /api/logged', () => {
            beforeEach(() => {
                // Limpiar todos los mocks antes de cada test
                jest.clearAllMocks();

                // Configuración básica del mock de User
                User.findById.mockImplementation((id) => {
                    if (id === 'non_existent_user') {
                        return Promise.resolve(null);
                    }
                    return Promise.resolve({
                        _id: id,
                        name: 'Test User',
                        email: 'test@example.com',
                        select: jest.fn().mockReturnThis(),
                        lean: jest.fn().mockResolvedValue({
                            _id: id,
                            name: 'Test User',
                            email: 'test@example.com'
                        })
                    });
                });
            });
            
            // 1. Header Authorization no enviado
            test('should return 400 when Authorization header is missing', async () => {
                const response = await request
                    .get('/api/logged');
                    // No se establece el header Authorization

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error', 'Access token requerido');
            });

            // 2. Access token es null
            test('should return 400 when Authorization header contains null', async () => {
                const response = await request
                    .get('/api/logged')
                    .set('Authorization', null);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error', 'Access token requerido');
            });

            // 3. Access token es string vacío
            test('should return 400 when Authorization header is empty string', async () => {
                const response = await request
                    .get('/api/logged')
                    .set('Authorization', '');

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error', 'Access token requerido');
            });

            // 4. Access token inválido/mal formado
            test('should return 401 for invalid/malformed token', async () => {
                const response = await request
                    .get('/api/logged')
                    .set('Authorization', 'invalid_token');
            
                expect(response.status).toBe(401);
                expect(response.body.error).toContain('Access Token inválido o expirado');
            });

            // 5. Access token válido pero expirado
            test('should return 401 for expired token', async () => {
                // Simular un token expirado usando el mock
                const response = await request
                    .get('/api/logged')
                    .set('Authorization', 'expired_token'); // Usar un token que el mock reconozca como inválido
            
                expect(response.status).toBe(401);
                expect(response.body.error).toContain('Access Token inválido o expirado');
            });

            // 5. Access token válido pero usuario no encontrado
            test('should return 400 when user not found', async () => {
                // Mockear jwt.verify para devolver un payload
                jwt.verify.mockReturnValue({ id: 'non_existent_user' });
                
                // Mockear User.findById para devolver null
                User.findById = jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(null)
                });         

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
                User.findById = jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockUser)
                });           

                const response = await request
                .get('/api/logged')
                .set('Authorization', 'valid_token');
            
                expect(response.status).toBe(200);
                expect(response.body).toEqual(mockUser);
                //expect(jwt.verify).toHaveBeenCalledWith('valid_token', process.env.JWT_SECRET);
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
                    .send(emptyData)
                    .set('Authorization', 'valid_token');

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
                .send({ refreshToken: refreshTokenTest })
                .set('Authorization', 'valid_token');
            
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
                .send({ refreshToken: refreshTokenTest })
                .set('Authorization', 'valid_token');
            
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
                    .send({ refreshToken: invalidToken })
                    .set('Authorization', 'valid_token');
            
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
                    .send({ refreshToken: validToken })
                    .set('Authorization', 'valid_token');
            
                // Verificar los resultados y respuesta (Assert)
                expect(RefreshToken.findOne).toHaveBeenCalledWith({ token: validToken });
                expect(RefreshToken.deleteOne).toHaveBeenCalledWith({ _id: mockTokenDoc._id });
                expect(response.status).toBe(200);
                expect(response.body.message).toBe('Sesión cerrada correctamente');
            });
        });

        // Probar Users
        describe('/api/users', () => {
            // 1. Header Authorization no enviado
            test('should return 400 when Authorization header is missing', async () => {
                const response = await request
                    .get('/api/users');
                    // No se establece el header Authorization

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error', 'Access token requerido');
            });

            // 2. Access token es null
            test('should return 400 when Authorization header contains null', async () => {
                const response = await request
                    .get('/api/users')
                    .set('Authorization', null);

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error', 'Access token requerido');
            });

            // 3. Access token es string vacío
            test('should return 400 when Authorization header is empty string', async () => {
                const response = await request
                    .get('/api/users')
                    .set('Authorization', '');

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error', 'Access token requerido');
            });

            // 4. Access token inválido
            test('should return 401 when Authorization header contains invalid token', async () => {
                const response = await request
                    .get('/api/users')
                    .set('Authorization', 'invalid-token');

                expect(response.status).toBe(401);
                expect(response.body.error).toMatch(/Access Token inválido o expirado/);
            });
            
            // 5. Access token válido - debería retornar lista de usuarios
            test('GET /api/users should return users list with valid token', async () => {
                // Preparar el entorno simulado (Arrange)
                const validToken = 'valid_token';
                User.find = jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue([
                        { _id: '1', name: 'User 1' },
                        { _id: '2', name: 'User 2' }
                    ])
                });

                // Enviar la solicitud (Act)
                const response = await request
                    .get('/api/users')
                    .set('Authorization', validToken);
                
                // Verificar los resultados y respuesta (Assert)
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
            });
            
            // 6. ID con formato inválido
            test('GET /api/users/:id should return 400 when ID format is invalid', async () => {
                const response = await request
                    .get('/api/users/invalid_object_id_format')
                    .set('Authorization', 'valid_token');
                
                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Invalid ID.');
            });

            // 7. ID válido pero usuario no encontrado
            test('GET /api/users/:id should return 404 when user is not found', async () => {
                const response = await request
                    .get('/api/users/non_existent_id')
                    .set('Authorization', 'valid_token');
                
                expect(response.status).toBe(404);
                expect(response.body.error).toContain('not found.');
            });

            // 8. Error del servidor durante validación
            test('GET /api/users/:id should return 500 when server error occurs during validation', async () => {
                const response = await request
                    .get('/api/users/server_error_id')
                    .set('Authorization', 'valid_token');
                
                expect(response.status).toBe(500);
                expect(response.body.error).toBe('Server error during validation.');
            });

            // 9. ID válido y usuario no encontrado
            test('GET /api/users/:id should return 404 when valid id but user not found', async () => {
                // Preparar el entorno simulado (Arrange)
                const validToken = 'valid_token';
                const validUserId = '507f1f77bcf86cd799439011';
                
                User.findOne = jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(null)
                });

                // Enviar la solicitud (Act)
                const response = await request
                    .get(`/api/users/${validUserId}`)
                    .set('Authorization', validToken);
                
                // Verificar los resultados y respuesta (Assert)
                expect(response.status).toBe(404);
                expect(response.body.error).toContain('not found');
            });

            // 10. ID válido y usuario encontrado
            test('GET /api/users/:id should return specific user with valid token and valid ID', async () => {
                // Preparar el entorno simulado (Arrange)
                const validToken = 'valid_token';
                const validUserId = '507f1f77bcf86cd799439011';
                
                User.findOne = jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue({
                        _id: validUserId,
                        name: 'User 1',
                        email: 'user1@test.com'
                    })
                });

                // Enviar la solicitud (Act)
                const response = await request
                    .get(`/api/users/${validUserId}`)
                    .set('Authorization', validToken);
                
                // Verificar los resultados y respuesta (Assert)
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('_id', validUserId);
                expect(response.body).toHaveProperty('name', 'User 1');
            });

            /*
            // 11. POST crear usuario - casos exitosos
            test('POST /api/users should create a new user with valid token and data', async () => {
                // Mock User.create to return a user object
                User.create.mockResolvedValue({
                  _id: 'newUserId',
                  name: 'New User',
                  email: 'new@user.com',
                  toObject: jest.fn().mockReturnValue({
                    _id: 'newUserId',
                    name: 'New User',
                    email: 'new@user.com'
                  })
                });
              
                const response = await request
                  .post('/api/users')
                  .set('Authorization', 'valid_token')
                  .send({
                    name: 'New User',
                    email: 'new@user.com',
                    password: 'password123'
                  });
              
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('data._id');
            });

            // 12. POST crear usuario - error de validación
            test('POST /api/users should return 400 when validation fails', async () => {
                const validToken = 'valid_token';
                const invalidUserData = {
                    // Datos inválidos que fallarán la validación
                    email: 'invalid-email',
                    password: '123' // muy corta
                };

                const response = await request
                    .post('/api/users')
                    .set('Authorization', validToken)
                    .send(invalidUserData);

                // El middleware de validación debería capturar esto
                expect(response.status).toBe(400);
            });

            // 13. POST crear usuario - forzar error de validación
            test('POST /api/users should handle validation middleware error', async () => {
                const validToken = 'valid_token';
                const userData = {
                    name: 'Test User',
                    email: 'test@test.com',
                    password: 'password123',
                    testForceValidationError: true // Flag para forzar error
                };

                const response = await request
                    .post('/api/users')
                    .set('Authorization', validToken)
                    .send(userData);

                expect(response.status).toBe(400);
            });

            // 14. POST getUsersBulk - caso exitoso
            test('POST /api/users/bulk should return users by IDs with valid token', async () => {
                // Preparar el entorno simulado (Arrange)
                const validToken = 'valid_token';
                const userIds = ['user1', 'user2', 'user3'];
                const mockUsers = [
                    { _id: 'user1', name: 'User 1', email: 'user1@test.com' },
                    { _id: 'user2', name: 'User 2', email: 'user2@test.com' },
                    { _id: 'user3', name: 'User 3', email: 'user3@test.com' }
                ];

                User.find = jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockUsers)
                });

                // Enviar la solicitud (Act)
                const response = await request
                    .post('/api/users/bulk')
                    .set('Authorization', validToken)
                    .send({ ids: userIds });

                // Verificar los resultados y respuesta (Assert)
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body).toHaveLength(3);
                expect(User.find).toHaveBeenCalledWith({
                    _id: { $in: userIds },
                    deletedAt: null
                });
            });

            // 15. POST getUsersBulk - sin array de IDs
            test('POST /api/users/bulk should return 400 when ids array is missing', async () => {
                const validToken = 'valid_token';

                const response = await request
                    .post('/api/users/bulk')
                    .set('Authorization', validToken)
                    .send({}); // Sin ids

                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Se requiere un array de IDs en el cuerpo de la solicitud');
            });

            // 16. POST getUsersBulk - IDs no es array
            test('POST /api/users/bulk should return 400 when ids is not an array', async () => {
                const validToken = 'valid_token';

                const response = await request
                    .post('/api/users/bulk')
                    .set('Authorization', validToken)
                    .send({ ids: 'not-an-array' });

                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Se requiere un array de IDs en el cuerpo de la solicitud');
            });

            // 17. POST getUsersBulk - usuarios no encontrados
            test('POST /api/users/bulk should return 404 when no users found', async () => {
                const validToken = 'valid_token';
                const userIds = ['nonexistent1', 'nonexistent2'];

                User.find = jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue([])
                });

                const response = await request
                    .post('/api/users/bulk')
                    .set('Authorization', validToken)
                    .send({ ids: userIds });

                expect(response.status).toBe(404);
                expect(response.body.error).toBe('Usuarios no encontrados');
            });

            // 18. PUT actualizar usuario - caso exitoso
            test('PUT /api/users/:id should update user with valid token and data', async () => {
                // Preparar el entorno simulado (Arrange)
                const validToken = 'valid_token';
                const userId = '507f1f77bcf86cd799439011';
                const updateData = {
                    name: 'Updated User',
                    email: 'updated@test.com'
                };

                const mockUpdatedUser = {
                    _id: userId,
                    name: 'Updated User',
                    email: 'updated@test.com',
                    toObject: jest.fn().mockReturnValue({
                        _id: userId,
                        name: 'Updated User',
                        email: 'updated@test.com',
                        password: 'hashedPassword'
                    })
                };

                User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

                // Enviar la solicitud (Act)
                const response = await request
                    .put(`/api/users/${userId}`)
                    .set('Authorization', validToken)
                    .send(updateData);

                // Verificar los resultados y respuesta (Assert)
                expect(response.status).toBe(200);
                expect(response.body.message).toBe('User Updated');
                expect(response.body.data).toHaveProperty('_id', userId);
                expect(response.body.data).not.toHaveProperty('password');
                expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                    userId,
                    expect.objectContaining(updateData),
                    { new: true }
                );
            });

            // 19. PUT actualizar usuario - con password
            test('PUT /api/users/:id should hash password when updating', async () => {
                const validToken = 'valid_token';
                const userId = '507f1f77bcf86cd799439011';
                const updateData = {
                    name: 'Updated User',
                    password: 'newpassword123'
                };

                const mockUpdatedUser = {
                    _id: userId,
                    name: 'Updated User',
                    toObject: jest.fn().mockReturnValue({
                        _id: userId,
                        name: 'Updated User',
                        password: 'hashedNewPassword'
                    })
                };

                bcrypt.hash = jest.fn().mockResolvedValue('hashedNewPassword');
                User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

                const response = await request
                    .put(`/api/users/${userId}`)
                    .set('Authorization', validToken)
                    .send(updateData);

                expect(response.status).toBe(200);
                expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
                expect(response.body.data).not.toHaveProperty('password');
            });

            // 20. PUT actualizar usuario - ID con formato inválido
            test('PUT /api/users/:id should return 400 when ID format is invalid', async () => {
                const validToken = 'valid_token';
                const updateData = { name: 'Updated User' };

                const response = await request
                    .put('/api/users/invalid_object_id_format')
                    .set('Authorization', validToken)
                    .send(updateData);

                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Invalid ID.');
            });

            // 21. PUT actualizar usuario - usuario no encontrado
            test('PUT /api/users/:id should return 404 when user not found', async () => {
                const validToken = 'valid_token';
                const userId = '507f1f77bcf86cd799439011';
                const updateData = { name: 'Updated User' };

                User.findByIdAndUpdate.mockResolvedValue(null);

                const response = await request
                    .put(`/api/users/${userId}`)
                    .set('Authorization', validToken)
                    .send(updateData);

                expect(response.status).toBe(404);
                expect(response.body.error).toBe('User not found');
            });

            // 22. PUT actualizar usuario - error de validación
            test('PUT /api/users/:id should handle validation middleware error', async () => {
                const validToken = 'valid_token';
                const userId = '507f1f77bcf86cd799439011';
                const updateData = {
                    name: 'Updated User',
                    testForceValidationError: true
                };

                const response = await request
                    .put(`/api/users/${userId}`)
                    .set('Authorization', validToken)
                    .send(updateData);

                expect(response.status).toBe(400);
            });

            // 23. DELETE usuario (soft delete) - caso exitoso
            test('DELETE /api/users/:id should soft delete user with valid token', async () => {
                // Preparar el entorno simulado (Arrange)
                const validToken = 'valid_token';
                const userId = '507f1f77bcf86cd799439011';

                const mockDeletedUser = {
                    _id: userId,
                    name: 'User to Delete',
                    email: 'delete@test.com',
                    deletedAt: new Date()
                };

                User.findByIdAndUpdate.mockResolvedValue(mockDeletedUser);

                // Enviar la solicitud (Act)
                const response = await request
                    .delete(`/api/users/${userId}`)
                    .set('Authorization', validToken);

                // Verificar los resultados y respuesta (Assert)
                expect(response.status).toBe(200);
                expect(response.body.message).toBe('User Disabled');
                expect(response.body.user).toHaveProperty('deletedAt');
                expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                    userId,
                    { deletedAt: expect.any(Date) },
                    { new: true }
                );
            });

            // 24. DELETE usuario - ID con formato inválido
            test('DELETE /api/users/:id should return 400 when ID format is invalid', async () => {
                const validToken = 'valid_token';

                const response = await request
                    .delete('/api/users/invalid_object_id_format')
                    .set('Authorization', validToken);

                expect(response.status).toBe(400);
                expect(response.body.error).toBe('Invalid ID.');
            });

            // 25. DELETE usuario - usuario no encontrado
            test('DELETE /api/users/:id should return 404 when user not found', async () => {
                const validToken = 'valid_token';
                const userId = '507f1f77bcf86cd799439011';

                User.findByIdAndUpdate.mockResolvedValue(null);

                const response = await request
                    .delete(`/api/users/${userId}`)
                    .set('Authorization', validToken);

                expect(response.status).toBe(404);
                expect(response.body.error).toBe('User not found');
            });

            // 26. GET /api/users - error del servidor
            test('GET /api/users should return 500 when server error occurs', async () => {
                const validToken = 'valid_token';
                
                User.find = jest.fn().mockReturnValue({
                    select: jest.fn().mockRejectedValue(new Error('Database connection failed'))
                });

                const response = await request
                    .get('/api/users')
                    .set('Authorization', validToken);

                expect(response.status).toBe(500);
                expect(response.body.error).toContain('Server Error:');
            });

            // 27. GET /api/users/:id - error del servidor
            test('GET /api/users/:id should return 500 when server error occurs', async () => {
                const validToken = 'valid_token';
                const userId = '507f1f77bcf86cd799439011';
                
                User.findOne = jest.fn().mockReturnValue({
                    select: jest.fn().mockRejectedValue(new Error('Database error'))
                });

                const response = await request
                    .get(`/api/users/${userId}`)
                    .set('Authorization', validToken);

                expect(response.status).toBe(500);
                expect(response.body.error).toContain('Server Error:');
            });

            // 28. POST /api/users - error del servidor
            test('POST /api/users should return 500 when server error occurs', async () => {
                const validToken = 'valid_token';
                const userData = {
                    name: 'Test User',
                    email: 'test@test.com',
                    password: 'password123'
                };

                bcrypt.hash = jest.fn().mockRejectedValue(new Error('Bcrypt error'));

                const response = await request
                    .post('/api/users')
                    .set('Authorization', validToken)
                    .send(userData);

                expect(response.status).toBe(500);
                expect(response.body.error).toContain('Server Error:');
            });

            // 29. PUT /api/users/:id - error del servidor
            test('PUT /api/users/:id should return 500 when server error occurs', async () => {
                const validToken = 'valid_token';
                const userId = '507f1f77bcf86cd799439011';
                const updateData = { name: 'Updated User' };

                User.findByIdAndUpdate.mockRejectedValue(new Error('Database update error'));

                const response = await request
                    .put(`/api/users/${userId}`)
                    .set('Authorization', validToken)
                    .send(updateData);

                expect(response.status).toBe(500);
                expect(response.body.error).toContain('Server Error:');
            });

            // 30. DELETE /api/users/:id - error del servidor
            test('DELETE /api/users/:id should return 500 when server error occurs', async () => {
                const validToken = 'valid_token';
                const userId = '507f1f77bcf86cd799439011';

                User.findByIdAndUpdate.mockRejectedValue(new Error('Database delete error'));

                const response = await request
                    .delete(`/api/users/${userId}`)
                    .set('Authorization', validToken);

                expect(response.status).toBe(500);
                expect(response.body.error).toContain('Server Error:');
            });

            // 31. POST /api/users/bulk - error del servidor
            test('POST /api/users/bulk should return 500 when server error occurs', async () => {
                const validToken = 'valid_token';
                const userIds = ['user1', 'user2'];

                User.find = jest.fn().mockReturnValue({
                    select: jest.fn().mockRejectedValue(new Error('Database bulk query error'))
                });

                const response = await request
                    .post('/api/users/bulk')
                    .set('Authorization', validToken)
                    .send({ ids: userIds });

                expect(response.status).toBe(500);
                expect(response.body.error).toContain('Error del servidor:');
            });

            // 32. GET /api/users - usuarios no encontrados (edge case)
            test('GET /api/users should return 404 when no users exist', async () => {
                const validToken = 'valid_token';
                
                User.find = jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(null)
                });

                const response = await request
                    .get('/api/users')
                    .set('Authorization', validToken);

                expect(response.status).toBe(404);
                expect(response.body.error).toBe('Users not found');
            });

            // 33. Test adicional para POST /api/users con campos adicionales
            test('POST /api/users should handle additional fields correctly', async () => {
                const validToken = 'valid_token';
                const userData = {
                    name: 'New User',
                    email: 'newuser@test.com',
                    password: 'password123',
                    avatar: null, // Debería usar default
                    role: 'user'
                };

                const mockCreatedUser = {
                    _id: 'new_user_id',
                    name: 'New User',
                    email: 'newuser@test.com',
                    avatar: 'default_avatar.png',
                    role: 'user',
                    save: jest.fn().mockResolvedValue(true)
                };

                User.create.mockResolvedValue(mockCreatedUser);
                bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword123');

                const response = await request
                    .post('/api/users')
                    .set('Authorization', validToken)
                    .send(userData);

                expect(response.status).toBe(201);
                expect(response.body.data).toHaveProperty('avatar');
            });

            // 34. Test adicional para PUT /api/users con avatar null
            test('PUT /api/users/:id should handle null avatar with default', async () => {
                const validToken = 'valid_token';
                const userId = '507f1f77bcf86cd799439011';
                const updateData = {
                    name: 'Updated User',
                    avatar: null // Debería usar default
                };

                const mockUpdatedUser = {
                    _id: userId,
                    name: 'Updated User',
                    avatar: 'default_avatar.png',
                    toObject: jest.fn().mockReturnValue({
                        _id: userId,
                        name: 'Updated User',
                        avatar: 'default_avatar.png'
                    })
                };

                User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

                const response = await request
                    .put(`/api/users/${userId}`)
                    .set('Authorization', validToken)
                    .send(updateData);

                expect(response.status).toBe(200);
                expect(response.body.data).toHaveProperty('avatar', 'default_avatar.png');
            });*/
        });

        /*describe('Projects API', () => {
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
});