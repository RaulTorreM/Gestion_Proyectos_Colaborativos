const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5m' });
}

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

const getUserIdFromToken = (req) => {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
    throw new Error('Authorization token is required');
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    if (!decoded.id) {
        throw new Error('Invalid token payload');
    }

    return decoded.id;
};

module.exports = { generateAccessToken, generateRefreshToken, getUserIdFromToken };
