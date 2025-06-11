const Project = require('../../../models/Project');
const { mockProjectHelpers, mockProject } = require('../../setup/mocks');

describe('PUT /api/projects/:id', () => {
  afterEach(() => {
    mockProjectHelpers.resetMocks();
  });

  // 1. Sin Authorization header
  test('should return 400 when Authorization header is missing', async () => {
    const response = await global.request
      .put('/api/projects/507f1f77bcf86cd799439011')
      .send({ name: 'Proyecto Actualizado' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Access token requerido');
  });

  // 2. Token inválido
  test('should return 401 when token is invalid', async () => {
    const response = await global.request
      .put('/api/projects/507f1f77bcf86cd799439011')
      .set('Authorization', 'invalid_token')
      .send({ name: 'Proyecto Actualizado' });

    expect(response.status).toBe(401);
    expect(response.body.error).toMatch(/Access Token inválido o expirado/);
  });

  // 3. Formato de ID inválido
  test('should return 404 when project ID format is invalid', async () => {
    const response = await global.request
      .put('/api/projects/invalid_id_format')
      .set('Authorization', 'valid_token')
      .send({ name: 'Proyecto Actualizado' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Project not found');
  });

  // 4. Proyecto no encontrado - CORREGIDO: usar setupUpdateMock en lugar de setupFindOneMock
  test('should return 404 when project is not found', async () => {
    mockProjectHelpers.setupUpdateMock(null); // Configurar findByIdAndUpdate para devolver null

    const response = await global.request
      .put('/api/projects/507f1f77bcf86cd799439011')
      .set('Authorization', 'valid_token')
      .send({ name: 'Proyecto Actualizado' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Project not found');
  });

  // 5. Proyecto actualizado correctamente - CORREGIDO
  test('should return 200 and updated project when project is successfully updated', async () => {
    const updatedProjectData = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Proyecto Actualizado',
      description: 'Descripción actualizada'
    };

    // Configurar mock para que findByIdAndUpdate devuelva el proyecto actualizado
    mockProjectHelpers.setupUpdateMock(updatedProjectData);

    const response = await global.request
      .put('/api/projects/507f1f77bcf86cd799439011')
      .set('Authorization', 'valid_token')
      .send({ name: 'Proyecto Actualizado' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Project Updated');
    expect(response.body.user).toHaveProperty('_id', '507f1f77bcf86cd799439011');
    expect(response.body.user).toHaveProperty('name', 'Proyecto Actualizado');
    
    // Verificar que se llamó findByIdAndUpdate con los parámetros correctos
    expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      expect.objectContaining({ name: 'Proyecto Actualizado' }),
      { new: true }
    );
  });

  // 6. Error del servidor durante actualización - CORREGIDO
  test('should return 500 when server error occurs during project update', async () => {
    // Configurar mock para que findByIdAndUpdate lance un error
    mockProjectHelpers.setupUpdateError(new Error('Error simulado de base de datos'));

    const response = await global.request
      .put('/api/projects/507f1f77bcf86cd799439011')
      .set('Authorization', 'valid_token')
      .send({ name: 'Proyecto Actualizado' });

    expect(response.status).toBe(500);
    expect(response.body.error).toContain('Server Error');
  });

  // 7. Test adicional: Verificar que se llame con los datos correctos
  test('should call findByIdAndUpdate with correct parameters', async () => {
    const projectData = {
      name: 'Nuevo Nombre',
      description: 'Nueva Descripción'
    };

    const updatedProject = {
      _id: '507f1f77bcf86cd799439011',
      ...projectData,
      toObject: jest.fn().mockReturnValue({
        _id: '507f1f77bcf86cd799439011',
        ...projectData
      })
    };

    mockProjectHelpers.setupUpdateMock(updatedProject);

    const response = await global.request
      .put('/api/projects/507f1f77bcf86cd799439011')
      .set('Authorization', 'valid_token')
      .send(projectData);

    expect(response.status).toBe(200);
    expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      expect.objectContaining(projectData),
      { new: true }
    );
  });

  // 8. Test para validar que se procesen correctamente los datos de entrada
  test('should process input data and call findByIdAndUpdate', async () => {
    const inputData = {
      name: 'Nuevo Nombre',
      description: 'Nueva Descripción'
    };

    const updatedProject = {
      _id: '507f1f77bcf86cd799439011',
      ...inputData,
      toObject: jest.fn().mockReturnValue({
        _id: '507f1f77bcf86cd799439011',
        ...inputData
      })
    };

    mockProjectHelpers.setupUpdateMock(updatedProject);

    const response = await global.request
      .put('/api/projects/507f1f77bcf86cd799439011')
      .set('Authorization', 'valid_token')
      .send(inputData);

    expect(response.status).toBe(200);
    
    // Verificar que se llamó findByIdAndUpdate
    expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      expect.any(Object), // Los datos procesados por BaseController
      { new: true }
    );
    
    // Verificar la estructura de la respuesta
    expect(response.body.message).toBe('Project Updated');
    expect(response.body.user).toHaveProperty('_id', '507f1f77bcf86cd799439011');
  });

  // 9. Test adicional: Verificar manejo de datos vacíos
  test('should handle empty update data', async () => {
    const updatedProject = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Proyecto Original',
      toObject: jest.fn().mockReturnValue({
        _id: '507f1f77bcf86cd799439011',
        name: 'Proyecto Original'
      })
    };

    mockProjectHelpers.setupUpdateMock(updatedProject);

    const response = await global.request
      .put('/api/projects/507f1f77bcf86cd799439011')
      .set('Authorization', 'valid_token')
      .send({}); // Datos vacíos

    expect(response.status).toBe(200);
    expect(Project.findByIdAndUpdate).toHaveBeenCalled();
  });
});