const Project = require('../../../models/Project');
const { mockProjectHelpers, mockProject } = require('../../setup/mocks');
const projectsController = require('../../../controllers/projects.controller');

describe('PATCH /api/projects/:id/archive', () => {

  // Limpiar mocks antes de cada test
  beforeEach(() => {
    mockProjectHelpers.resetMocks();
  });

  // ✅ Proyecto no encontrado (404)
  it('debería retornar 404 si el proyecto no existe', async () => {
    mockProjectHelpers.setupFindByIdMock(null);

    const req = {
      params: { id: 'mockProjectId' },
      user: { _id: 'mockUserId', isAdmin: false },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await projectsController.archiveProject(req, res);

    expect(Project.findById).toHaveBeenCalledWith('mockProjectId');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Proyecto no encontrado' });
  });

  // ✅ Usuario sin permisos (403)
  it('debería retornar 403 si el usuario no es autor ni admin', async () => {
    const anotherProject = { ...mockProject, authorUserId: 'otherUserId' };
    mockProjectHelpers.setupFindByIdMock(anotherProject);

    const req = {
      params: { id: 'mockProjectId' },
      user: { _id: 'mockUserId', isAdmin: false },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await projectsController.archiveProject(req, res);

    expect(Project.findById).toHaveBeenCalledWith('mockProjectId');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'No autorizado para archivar este proyecto' });
  });

  // ✅ Error interno (500)
  it('debería retornar 500 si ocurre un error', async () => {
    mockProjectHelpers.setupFindByIdError(new Error('Fallo inesperado'));

    const req = {
      params: { id: 'mockProjectId' },
      user: { _id: 'mockUserId', isAdmin: true },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await projectsController.archiveProject(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Error al archivar el proyecto',
      details: 'Fallo inesperado',
    }));
  });

  // ✅ Archivado exitoso (200)
  it('debería archivar correctamente el proyecto si el usuario tiene permisos', async () => {
    mockProjectHelpers.setupFindByIdMock(mockProject);
    const updatedProject = { ...mockProject, status: 'Archivado' };
    mockProjectHelpers.setupUpdateMock(updatedProject);

    const req = {
      params: { id: 'mockProjectId' },
      user: { _id: 'mockUserId', isAdmin: false },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await projectsController.archiveProject(req, res);

    expect(Project.findById).toHaveBeenCalledWith('mockProjectId');
    expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
      'mockProjectId',
      expect.objectContaining({
        status: 'Archivado',
        archivedAt: expect.any(Date),
        archivedBy: 'mockUserId'
      }),
      { new: true }
    );

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
		success: true,
		message: 'Proyecto archivado correctamente',
		project: expect.objectContaining({
		  _id: 'mockProjectId',
		  status: 'Archivado',
		}),
	}));
  });

});
