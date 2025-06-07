// Primero los mocks antes de cualquier importación (se llaman automáticamente en los tests)
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

// Crear instancia de supertest
const request = supertest(app);

describe('Private Routes', () => {
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