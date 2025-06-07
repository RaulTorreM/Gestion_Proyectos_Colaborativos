jest.mock('../../../lib/token', () => ({
    generateAccessToken: jest.fn(() => 'mockAccessToken'),
    generateRefreshToken: jest.fn(() => 'mockRefreshToken'),
    getUserIdFromToken: jest.fn(() => 'mockUserIdFromToken')
}));