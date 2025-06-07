const User = require('../../../models/User');

describe('DELETE /api/users/:id ', () => {
	// 23. DELETE usuario (soft delete) - caso exitoso
	test('hould soft delete user with valid token', async () => {
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
	test('should return 400 when ID format is invalid', async () => {
		const validToken = 'valid_token';

		const response = await request
			.delete('/api/users/invalid_object_id_format')
			.set('Authorization', validToken);

		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Invalid ID.');
	});

	// 25. DELETE usuario - usuario no encontrado
	test('should return 404 when user not found', async () => {
		const validToken = 'valid_token';
		const userId = '507f1f77bcf86cd799439011';

		User.findByIdAndUpdate.mockResolvedValue(null);

		const response = await request
			.delete(`/api/users/${userId}`)
			.set('Authorization', validToken);

		expect(response.status).toBe(404);
		expect(response.body.error).toBe('User not found');
	});

	// 30. DELETE /api/users/:id - error del servidor
	test('should return 500 when server error occurs', async () => {
		const validToken = 'valid_token';
		const userId = '507f1f77bcf86cd799439011';

		User.findByIdAndUpdate.mockRejectedValue(new Error('Database delete error'));

		const response = await request
			.delete(`/api/users/${userId}`)
			.set('Authorization', validToken);

		expect(response.status).toBe(500);
		expect(response.body.error).toContain('Server Error:');
	});
});

