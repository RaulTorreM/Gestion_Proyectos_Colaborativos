jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const { refreshTokenMock } = require('./refreshTokenMock');
const { tokenLibMock } = require('./tokenLibMock');
const { userMock } = require('./userMock');
const { projectMock } = require('./projectMock');
const { validateObjectIdMock } = require('./middlewares/validateObjectIdMock');
const { validateProjectMock } = require('./middlewares/validateProjectMock');
const { validateResultMock } = require('./middlewares/validateResultMock');
const { validateTokenMock } = require('./middlewares/validateTokenMock');
const { validateUserMock } = require('./middlewares/validateUserMock');

module.exports = {
	refreshTokenMock,
	tokenLibMock,
	userMock,
	projectMock,
	validateObjectIdMock,
	validateProjectMock,
	validateResultMock,
	validateTokenMock,
	validateUserMock
};
