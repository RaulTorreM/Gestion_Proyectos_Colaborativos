const User = require('../../../models/User'); 
const mongoose = require('mongoose'); 
const { mockHelpers } = require('../../setup/mocks'); 

describe('POST /api/users', () => { 
	// Limpiar mocks antes de cada test
	beforeEach(() => {
		mockHelpers.resetMocks();
	});

	// 11. POST crear usuario - forzar error de validación 
	test('should handle validation middleware error', async () => { 
		const response = await global.request 
			.post('/api/users') 
			.set('Authorization', 'valid_token') 
			.set('X-Test-Force-Validation-Error', 'true') 
			.send({ 
				name: 'Test User', 
				email: 'test@test.com', 
				password: 'password123' 
			}); 
 
		expect(response.status).toBe(400); 
	}); 
 
	// 12. POST crear usuario - caso exitoso 
	test('should create a new user with valid token and data', async () => { 
		const newUserData = { 
			_id: 'newUserId', 
			name: 'New User', 
			email: 'new@user.com' 
		}; 
 
		mockHelpers.setupCreateMock(newUserData); 
 
		const response = await global.request 
			.post('/api/users') 
			.set('Authorization', 'valid_token') 
			.send({ 
				name: 'New User', 
				email: 'new@user.com', 
				password: 'password123' 
			}); 
 
		expect(response.status).toBe(201); 
		expect(response.body.data).toHaveProperty('_id', 'newUserId'); 
	}); 
 
	// 13. POST getUsersBulk - caso exitoso
	test('POST /api/users/bulk/ids should return users by IDs with valid token', async () => { 
		const userIds = ['user1', 'user2', 'user3'];
		const mockUsers = [
			{ _id: 'user1', name: 'User One', email: 'user1@test.com' },
			{ _id: 'user2', name: 'User Two', email: 'user2@test.com' },
			{ _id: 'user3', name: 'User Three', email: 'user3@test.com' }
		];

		// Configurar el mock para devolver usuarios
		mockHelpers.setupFindBulkMock(mockUsers);

		const response = await global.request
			.post('/api/users/bulk/ids')
			.set('Authorization', 'valid_token')
			.send({ ids: userIds });

		expect(response.status).toBe(200);
		expect(response.body).toEqual(mockUsers);
		expect(response.body).toHaveLength(3);
		expect(response.body[0]).toHaveProperty('_id', 'user1');
		expect(response.body[0]).toHaveProperty('name', 'User One');
		expect(response.body[0]).toHaveProperty('email', 'user1@test.com');
	}); 

	// 14. POST getUsersBulk - sin array de IDs 
	test('POST /api/users/bulk/ids should return 400 when ids array is missing', async () => { 
		const response = await global.request 
			.post('/api/users/bulk/ids') 
			.set('Authorization', 'valid_token') 
			.send({}); 
 
		expect(response.status).toBe(400); 
		expect(response.body.error).toBe('Se requiere un array de IDs en el cuerpo de la solicitud'); 
	}); 
 
	// 15. POST getUsersBulk - IDs no es array 
	test('POST /api/users/bulk/ids should return 400 when ids is not an array', async () => { 
		const response = await global.request 
			.post('/api/users/bulk/ids') 
			.set('Authorization', 'valid_token') 
			.send({ ids: 'not-an-array' }); 
 
		expect(response.status).toBe(400); 
		expect(response.body.error).toBe('Se requiere un array de IDs en el cuerpo de la solicitud'); 
	}); 

	// 16. POST getUsersBulk - formato de ID inválido
	test('POST /api/users/bulk/ids should return 400 when ID format is invalid', async () => {
		const response = await global.request
			.post('/api/users/bulk/ids')
			.set('Authorization', 'valid_token')
			.send({ ids: ['invalid_object_id_format'] });

		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Formato de ID inválido');
	});
 
	// 17. POST getUsersBulk - usuarios no encontrados 
	test('POST /api/users/bulk/ids should return 404 when some IDs do not exist', async () => { 
		const response = await global.request 
			.post('/api/users/bulk/ids') 
			.set('Authorization', 'valid_token') 
			.send({ ids: ['non_existent_id'] }); 
		 
		expect(response.status).toBe(404); 
		expect(response.body.error).toBe('Algunos IDs no existen en la base de datos'); 
		expect(response.body.nonExistentIds).toEqual(['non_existent_id']); 
	}); 

	// 18. POST getUsersBulk - usuarios no encontrados (array vacío)
	test('POST /api/users/bulk/ids should return 404 when no users found', async () => {
		// Configurar el mock para devolver array vacío
		mockHelpers.setupFindBulkMock([]);

		const response = await global.request
			.post('/api/users/bulk/ids')
			.set('Authorization', 'valid_token')
			.send({ ids: ['validId1', 'validId2'] });

		expect(response.status).toBe(404);
		expect(response.body.error).toBe('Usuarios no encontrados');
	});

	// 19. POST getUsersBulk - error del servidor
	test('POST /api/users/bulk/ids should return 500 on server error', async () => {
		const response = await global.request
			.post('/api/users/bulk/ids')
			.set('Authorization', 'valid_token')
			.send({ ids: ['server_error_id'] });

		expect(response.status).toBe(500);
		expect(response.body.error).toBe('Error del servidor: Simulated server error');
	});

	// 20. Test adicional para verificar que se llama al método correcto
	test('POST /api/users/bulk/ids should call User.find with correct parameters', async () => {
		const userIds = ['user1', 'user2'];
		const mockUsers = [
			{ _id: 'user1', name: 'User One', email: 'user1@test.com' }
		];

		mockHelpers.setupFindBulkMock(mockUsers);

		await global.request
			.post('/api/users/bulk/ids')
			.set('Authorization', 'valid_token')
			.send({ ids: userIds });

		// Verificar que User.find fue llamado con los parámetros correctos
		expect(User.find).toHaveBeenCalledWith({ 
			_id: { $in: userIds },
			deletedAt: null 
		});
	});
});