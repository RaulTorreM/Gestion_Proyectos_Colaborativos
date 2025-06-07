const RefreshToken = require('../../../models/RefreshToken');

describe('POST /api/logout', () => {
	// 1. Refresh token no enviado
	test('should return 400 when refresh token is missing', async () => {
		// Preparar el entorno simulado (Arrange)
		const emptyData = {};

		// Enviar la solicitud (Act)
		const response = await global.request
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
		const response = await global.request
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
		const response = await global.request
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
		const response = await global.request
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
		const response = await global.request
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