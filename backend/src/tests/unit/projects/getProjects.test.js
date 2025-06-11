const Project = require('../../../models/Project');
const { mockProjectHelpers } = require('../../setup/mocks');

describe('GET /api/projects', () => {
	// 1. Header Authorization no enviado
	test('should return 400 when Authorization header is missing', async () => {
		const response = await global.request.get('/api/projects');

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('error', 'Access token requerido');
	});

	// 2. Access token es null
	test('should return 400 when Authorization header is null', async () => {
		const response = await global.request
			.get('/api/projects')
			.set('Authorization', null);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('error', 'Access token requerido');
	});

	// 3. Access token string vacío
	test('should return 400 when Authorization header is empty', async () => {
		const response = await global.request
			.get('/api/projects')
			.set('Authorization', '');

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty('error', 'Access token requerido');
	});

	// 4. Token inválido
	test('should return 401 when token is invalid', async () => {
		const response = await global.request
			.get('/api/projects')
			.set('Authorization', 'invalid_token');

		expect(response.status).toBe(401);
		expect(response.body.error).toMatch(/Access Token inválido o expirado/);
	});

	// 5. Token válido — obtener lista de proyectos
	test('should return 200 and projects list when token is valid', async () => {
		const mockProjects = [
			{ _id: '1', name: 'Proyecto 1' },
			{ _id: '2', name: 'Proyecto 2' },
		];

		mockProjectHelpers.setupFindMock(mockProjects);

		const response = await global.request
			.get('/api/projects')
			.set('Authorization', 'valid_token');

		expect(response.status).toBe(200);
	});

	// 6. Error del servidor simulando fallo en find
	test('should return 500 when server error occurs on project list retrieval', async () => {
		mockProjectHelpers.setupFindError(new Error('Error simulado'));

		const response = await global.request
			.get('/api/projects')
			.set('Authorization', 'valid_token');

		expect(response.status).toBe(500);
	});
});

describe('GET /api/projects/:id', () => {
	// 1. Formato de ID inválido — CORREGIDO: debe ser 400
	test('should return 400 when ID format is invalid', async () => {
		const response = await global.request
			.get('/api/projects/invalid_object_id_format')
			.set('Authorization', 'valid_token');

		expect(response.status).toBe(400);
		expect(response.body.error).toBe('Invalid ID.');
	});

	// 2. Proyecto no encontrado
	test('should return 404 when project is not found', async () => {
		mockProjectHelpers.setupFindOneMock(null);

		const response = await global.request
			.get('/api/projects/507f1f77bcf86cd799439011')
			.set('Authorization', 'valid_token');

		expect(response.status).toBe(404);
		expect(response.body.error).toContain('not found');
	});

	// 3. Proyecto encontrado correctamente
	test('should return 200 and project details when found by ID', async () => {
		const mockProject = {
			_id: '507f1f77bcf86cd799439011',
			name: 'Proyecto Test',
		};

		mockProjectHelpers.setupFindOneMock(mockProject);

		const response = await global.request
			.get(`/api/projects/${mockProject._id}`)
			.set('Authorization', 'valid_token');

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('_id', mockProject._id);
		expect(response.body).toHaveProperty('name', 'Proyecto Test');
	});

	// 4. Error del servidor en findOne
	test('should return 500 when server error occurs on project retrieval by ID', async () => {
		Project.findOne.mockRejectedValue(new Error('Error simulado'));

		const response = await global.request
			.get('/api/projects/507f1f77bcf86cd799439011')
			.set('Authorization', 'valid_token');

		expect(response.status).toBe(500);
	});
});
