const jwt = require('jsonwebtoken');

exports.validateToken = (req, res, next) => {
  const accessToken = req.headers.authorization;

  // Validar si el token existe o es válido
  if (!accessToken || accessToken === null || accessToken === 'null' || accessToken === '') {
    return res.status(400).json({ error: 'Access token requerido' });
  }

  try {
    // Validar y decodificar el JWT
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: `Access Token inválido o expirado: ${error.message}` });
  }
};
