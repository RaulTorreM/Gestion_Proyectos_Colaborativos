const mockProject = {
    _id: 'mockProjectId',
    name: 'Mock Project',
    description: 'Mock Description',
    startDate: new Date(),
    dueDate: new Date(),
    status: 'Activo',
    authorUserId: 'mockUserId',
    save: jest.fn().mockResolvedValue({
        _id: 'mockProjectId',
        name: 'Mock Project',
        description: 'Mock Description',
    }),
    toObject: jest.fn().mockReturnValue({
        _id: 'mockProjectId',
        name: 'Mock Project',
        description: 'Mock Description',
    }),
};
  
const MockProjectConstructor = jest.fn().mockImplementation((projectData) => {
    return {
        ...mockProject,
        ...projectData,
        _id: projectData?._id || 'generatedProjectId',
        save: jest.fn().mockResolvedValue({
        ...mockProject,
        ...projectData,
        _id: projectData?._id || 'generatedProjectId',
        }),
        toObject: jest.fn().mockReturnValue({
        ...mockProject,
        ...projectData,
        }),
    };
});
  
const createQueryChainMock = (finalResult = []) => {
    const queryChain = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(finalResult),
    };
    queryChain.select.mockReturnValue(queryChain);
    queryChain.lean.mockReturnValue(queryChain);
    return queryChain;
};
  
// Métodos estáticos
MockProjectConstructor.find = jest.fn(() => createQueryChainMock([]));
MockProjectConstructor.findOne = jest.fn();
MockProjectConstructor.findById = jest.fn();
MockProjectConstructor.findByIdAndUpdate = jest.fn();
MockProjectConstructor.findByIdAndDelete = jest.fn();
MockProjectConstructor.create = jest.fn().mockResolvedValue(mockProject);
  
jest.mock('../../../models/Project', () => MockProjectConstructor);
  
// Helpers para tests
const mockProjectHelpers = {
    resetMocks: () => {
        MockProjectConstructor.mockClear();
        MockProjectConstructor.find.mockReset();
        MockProjectConstructor.findOne.mockReset();
        MockProjectConstructor.findById.mockReset();
        MockProjectConstructor.findByIdAndUpdate.mockReset();
        MockProjectConstructor.findByIdAndDelete.mockReset();
        MockProjectConstructor.create.mockReset();
    },
      
    setupCreateMock: (projectData = mockProject) => {
        MockProjectConstructor.create.mockResolvedValue(projectData);
        MockProjectConstructor.mockImplementation((data) => ({
        ...projectData,
        ...data,
        save: jest.fn().mockResolvedValue({ ...projectData, ...data }),
        }));
    },
    
    setupFindMock: (projects = []) => {
        MockProjectConstructor.find.mockReturnValue(createQueryChainMock(projects));
    },
    
    setupFindOneMock: (project = null) => {
        MockProjectConstructor.findOne.mockResolvedValue(project);
    },

    setupFindByIdMock: (project = null) => {
        MockProjectConstructor.findById.mockResolvedValue(project);
    },

    setupUpdateMock: (updatedProject = null) => {
        if (updatedProject === null) {
        MockProjectConstructor.findByIdAndUpdate.mockResolvedValue(null);
        } else {
        const mockProjectWithToObject = {
            ...updatedProject,
            toObject: jest.fn().mockReturnValue({
            ...updatedProject,
            }),
        };
        MockProjectConstructor.findByIdAndUpdate.mockResolvedValue(mockProjectWithToObject);
        }
    },
    
    setupDeleteMock: (deletedProject = null) => {
        MockProjectConstructor.findByIdAndDelete.mockResolvedValue(deletedProject);
    },

    setupFindError: (error) => {
        MockProjectConstructor.find.mockImplementation(() => {
        throw error;
        });
    },

    setupFindByIdError: (error) => {
        MockProjectConstructor.findById.mockRejectedValue(error);
    },
      
    setupUpdateError: (error) => {
        MockProjectConstructor.findByIdAndUpdate.mockRejectedValue(error);
    },

    setupFindByIdCastError: () => {
        const error = new Error('Cast to ObjectId failed');
        error.name = 'CastError';
        MockProjectConstructor.findById.mockImplementation(() => {
          throw error;
        });
    }
};
  
module.exports = {
    mockProject,
    MockProjectConstructor,
    mockProjectHelpers,
};
