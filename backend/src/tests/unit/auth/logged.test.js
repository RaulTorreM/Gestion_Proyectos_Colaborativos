const User = require('../../../models/User');
const jwt = require('jsonwebtoken');

describe('GET /api/logged', () => {
	beforeEach(() => {
		// Mock por defecto para jwt.verify → siempre devuelve un id válido
		jwt.verify = jest.fn().mockReturnValue({ id: 'user123' });

		// Mock por defecto para User.findById → devuelve un usuario de prueba
		User.findById = jest.fn().mockReturnValue({
		select: jest.fn().mockResolvedValue({
			_id: 'user123',
			name: 'Test User',
			email: 'test@example.com'
		})
		});
	});

	// 1. Header Authorization no enviado
	test('should return 400 when Authorization header is missing', async () => {
		const response = await request.get('/api/logged');

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
		// Simular que jwt.verify lanza error para token inválido
		jwt.verify.mockImplementationOnce(() => {
		throw new Error('jwt malformed');
		});

		const response = await request
		.get('/api/logged')
		.set('Authorization', 'invalid_token');

		expect(response.status).toBe(401);
		expect(response.body.error).toContain('Access Token inválido o expirado');
	});

	// 5. Access token válido pero expirado
	test('should return 401 for expired token', async () => {
		jwt.verify.mockImplementationOnce(() => {
		throw new Error('jwt expired');
		});

		const response = await request
		.get('/api/logged')
		.set('Authorization', 'expired_token');

		expect(response.status).toBe(401);
		expect(response.body.error).toContain('Access Token inválido o expirado');
	});

	// 6. Access token válido pero usuario no encontrado
	test('should return 400 when user not found', async () => {
		jwt.verify.mockReturnValueOnce({ id: 'non_existent_user' });

		User.findById.mockReturnValueOnce({
		select: jest.fn().mockResolvedValue(null)
		});

		const response = await request
		.get('/api/logged')
		.set('Authorization', 'valid_token_but_no_user');

		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Usuario con este Access token no encontrado');
		expect(User.findById).toHaveBeenCalledWith('non_existent_user');
	});

	// 7. Access token válido y usuario encontrado
	test('should return 200 with user data for valid token', async () => {
		const mockUser = {
		_id: 'user123',
		name: 'Test User',
		email: 'test@example.com'
		};

		const response = await request
		.get('/api/logged')
		.set('Authorization', 'valid_token');

		expect(response.status).toBe(200);
		expect(response.body).toEqual(mockUser);
		expect(User.findById).toHaveBeenCalledWith('user123');
	});
});
