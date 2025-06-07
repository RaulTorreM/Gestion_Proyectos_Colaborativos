const mockUser = {
	_id: 'mockUserId',
	name: 'Mock User',
	email: 'mock@user.com',
	save: jest.fn().mockResolvedValue(true),
	toObject: jest.fn().mockReturnThis(),
	select: jest.fn().mockReturnThis(),
	lean: jest.fn().mockReturnThis()
};

jest.mock('../../../models/User', () => ({
	findOne: jest.fn(),
	findById: jest.fn(),
	find: jest.fn(),
	create: jest.fn().mockResolvedValue(mockUser),
	findByIdAndUpdate: jest.fn(),
	findByIdAndDelete: jest.fn(),
	prototype: {
		save: jest.fn().mockResolvedValue(mockUser)
	}
}));

module.exports = { mockUser };
  