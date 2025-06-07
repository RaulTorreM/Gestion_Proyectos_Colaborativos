const bcrypt = require('bcrypt');
const User = require('../../../models/User');
const RefreshToken = require('../../../models/RefreshToken');
const { generateAccessToken, generateRefreshToken } = require('../../../lib/token');

describe('POST /api/login', () => {
	// 1. Test para usuario no encontrado
	test('should return 404 when user is not found', async () => {
		// Preparar el entorno simulado (Arrange)
		User.findOne.mockResolvedValue(null); // Simular que no se encuentra el usuario
	
		// Enviar la solicitud (Act)
		const response = await global.request
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
		const response = await global.request
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
		const response = await global.request
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