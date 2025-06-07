// Ahora sí importar las dependencias
const RefreshToken = require('../../../models/RefreshToken');
const jwt = require('jsonwebtoken');    
const { generateAccessToken } = require('../../../lib/token');

describe('POST /api/refresh-token', () => {
	beforeEach(() => {
	jest.clearAllMocks();
	});

	// 1. Test cuando no se envía refresh token
	test('should return 400 when refresh token is missing', async () => {
	const response = await global.request
		.post('/api/refresh-token')
		.send({});
	
	expect(response.status).toBe(400);
	expect(response.body.error).toBe('Refresh Token requerido');
	expect(RefreshToken.findOne).not.toHaveBeenCalled();
	});

	// 2. Test cuando el refresh token no existe en la BD
	test('should return 403 when refresh token is not found in database', async () => {
	RefreshToken.findOne.mockResolvedValue(null);

	const response = await global.request
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

	const response = await global.request
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

	const response = await global.request
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