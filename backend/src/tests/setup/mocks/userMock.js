// Actualización del archivo de mocks para incluir soporte completo para updateUser
const mockUser = {
	_id: 'mockUserId',
	name: 'Mock User',
	email: 'mock@user.com',
	save: jest.fn().mockResolvedValue({
		_id: 'mockUserId',
		name: 'Mock User',
		email: 'mock@user.com'
	}),
	toObject: jest.fn().mockReturnValue({
		_id: 'mockUserId',
		name: 'Mock User',
		email: 'mock@user.com'
	})
};

// Create a mock constructor that can be called with 'new'
const MockUserConstructor = jest.fn().mockImplementation((userData) => {
	return {
		...mockUser,
		...userData,
		_id: userData?._id || 'generatedId',
		save: jest.fn().mockResolvedValue({
			...mockUser,
			...userData,
			_id: userData?._id || 'generatedId'
		})
	};
});

// Función para crear un query chain mock
const createQueryChainMock = (finalResult = []) => {
	const queryChain = {
		select: jest.fn().mockReturnThis(),
		lean: jest.fn().mockReturnThis(),
		exec: jest.fn().mockResolvedValue(finalResult)
	};
	
	// Cada método debe retornar el objeto queryChain para permitir encadenamiento
	queryChain.select.mockReturnValue(queryChain);
	queryChain.lean.mockReturnValue(queryChain);
	
	return queryChain;
};

// Add static methods to the constructor
MockUserConstructor.findOne = jest.fn();
MockUserConstructor.findById = jest.fn();
MockUserConstructor.find = jest.fn(() => createQueryChainMock([])); // Default empty result
MockUserConstructor.create = jest.fn().mockResolvedValue(mockUser);
MockUserConstructor.findByIdAndUpdate = jest.fn();
MockUserConstructor.findByIdAndDelete = jest.fn();

// Mock the User model
jest.mock('../../../models/User', () => MockUserConstructor);

// Helper functions for easier test setup
const mockHelpers = {
	// Reset all mocks
	resetMocks: () => {
		MockUserConstructor.mockClear();
		MockUserConstructor.findOne.mockReset();
		MockUserConstructor.findById.mockReset();
		MockUserConstructor.find.mockReset();
		MockUserConstructor.create.mockReset();
		MockUserConstructor.findByIdAndUpdate.mockReset();
		MockUserConstructor.findByIdAndDelete.mockReset();
	},

	// Setup create user mock
	setupCreateMock: (userData = mockUser) => {
		MockUserConstructor.create.mockResolvedValue(userData);
		// Also setup constructor for 'new User()' calls
		MockUserConstructor.mockImplementation((data) => ({
			...userData,
			...data,
			save: jest.fn().mockResolvedValue({ ...userData, ...data })
		}));
	},

	// Setup find bulk mock
	setupFindBulkMock: (users = []) => {
		MockUserConstructor.find.mockReturnValue(createQueryChainMock(users));
	},
	  
	// Setup find one mock
	setupFindOneMock: (user = null) => {
		MockUserConstructor.findOne.mockResolvedValue(user);
	},

	// Setup find by id mock
	setupFindByIdMock: (user = null) => {
		MockUserConstructor.findById.mockResolvedValue(user);
	},

	// setupUpdateMock corregido
	setupUpdateMock: (updatedUser = null) => {
		if (updatedUser === null) {
		MockUserConstructor.findByIdAndUpdate.mockResolvedValue(null);
		} else {
		// Crear mock con método toObject que devuelve el objeto plano sin toObject ni funciones
		const mockUserWithToObject = {
			...updatedUser,
			toObject: jest.fn().mockReturnValue(() => {
			// Esta función no debería devolver otra función, debe devolver un objeto plano
			const obj = { ...updatedUser };
			// eliminar referencias cíclicas o funciones si existiesen
			delete obj.toObject;
			return obj;
			}),
		};
	
		// El problema es que toObject está devolviendo una función, corregimos:
		mockUserWithToObject.toObject.mockReturnValue(() => {
			const obj = { ...updatedUser };
			delete obj.toObject;
			return obj;
		});
	
		// Pero la forma correcta es que toObject() devuelva el objeto, no una función, así que:
		mockUserWithToObject.toObject.mockReturnValue({
			...updatedUser,
		});
	
		MockUserConstructor.findByIdAndUpdate.mockResolvedValue(mockUserWithToObject);
		}
	},

	// Setup delete mock
	setupDeleteMock: (deletedUser = null) => {
		MockUserConstructor.findByIdAndDelete.mockResolvedValue(deletedUser);
	},

	// Helper para configurar errores específicos
	setupUpdateError: (error) => {
		MockUserConstructor.findByIdAndUpdate.mockRejectedValue(error);
	},

	setupFindError: (error) => {
		MockUserConstructor.find.mockImplementation(() => {
			throw error;
		});
	}
};

module.exports = { 
	mockUser,
	mockHelpers,
	MockUserConstructor
};