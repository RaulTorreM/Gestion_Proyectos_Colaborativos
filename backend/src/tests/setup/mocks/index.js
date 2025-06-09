jest.mock('jsonwebtoken');
jest.mock('bcrypt');

const bcrypt = require('bcrypt');
bcrypt.hash = jest.fn((password, saltRounds) => {
	return Promise.resolve(`hashed_${password}`);
});
  

const { refreshTokenMock } = require('./refreshTokenMock');
const { tokenLibMock } = require('./tokenLibMock');
const { mockUser, mockHelpers, MockUserConstructor } = require('./userMock');
const { baseControllerMock } = require('./baseControllerMock');
const { projectMock } = require('./projectMock');
const { validateObjectIdMock } = require('./middlewares/validateObjectIdMock');
const { validateObjectIdArrayMock } = require('./middlewares/validateObjectIdArrayMock');
const { validateProjectMock } = require('./middlewares/validateProjectMock');
const { validateResultMock } = require('./middlewares/validateResultMock');
const { validateTokenMock } = require('./middlewares/validateTokenMock');
const { validateUserMock } = require('./middlewares/validateUserMock');

module.exports = {
	refreshTokenMock,
	tokenLibMock,
	mockUser,
	mockHelpers,
	MockUserConstructor,
	baseControllerMock,
	projectMock,
	validateObjectIdMock,
	validateObjectIdArrayMock,
	validateProjectMock,
	validateResultMock,
	validateTokenMock,
	validateUserMock
};
