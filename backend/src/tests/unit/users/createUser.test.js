const User = require('../../../models/User');

describe('POST /api/users', () => {
	// 11. POST crear usuario - casos exitosos
	test('should create a new user with valid token and data', async () => {
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
	test('should return 400 when validation fails', async () => {
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
	test('should handle validation middleware error', async () => {
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
});
