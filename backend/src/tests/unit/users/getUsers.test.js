const User = require('../../../models/User');

describe('GET /api/users', () => {
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
});
