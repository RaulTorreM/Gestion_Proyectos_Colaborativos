const jwt = require('jsonwebtoken');

exports.validateToken = (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    return res.status(401).json({ error: 'Access Token no proporcionado' });
  }

  // Extraer token si viene con "Bearer "
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: `Access Token inválido o expirado: ${error.message}` });
  }
};
