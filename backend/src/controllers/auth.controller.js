const jwt = require('jsonwebtoken');
const User = require('../models/User'); // suponiendo que existe
const RefreshToken = require('../models/RefreshToken');
const { generateAccessToken, generateRefreshToken } = require('../lib/token');
const bcrypt = require('bcrypt');

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: 'Credenciales incorrectas' });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await RefreshToken.create({ token: refreshToken, userId: user._id });

  res.status(200).json({ accessToken, refreshToken });
}

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh Token requerido' });

  const tokenInDb = await RefreshToken.findOne({ token: refreshToken });
  if (!tokenInDb) return res.status(403).json({ error: 'Refresh Token inválido' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = { _id: decoded.id };
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Refresh Token expirado o inválido' });
  }
}

exports.getLoggedUser = async (req, res) => {
  const accessToken = req.get('Authorization');
  if (!accessToken) return res.status(400).json({ error: 'Access token requerido' });

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) return res.status(400).json({ error: 'Usuario con este Access token no encontrado' });

    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error: 'Access Token expirado o inválido. ' + error.message });
  }
}

exports.logoutUser = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token requerido' });

  await RefreshToken.deleteOne({ token: refreshToken });

  res.status(200).json({ error: 'Sesión cerrada correctamente' });
}
