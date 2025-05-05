const jwt = require('jsonwebtoken');

exports.validateToken = (req, res, next) => {
  //const token = req.headers['authorization'];
  const accessToken = req.get('Authorization'); // más seguro

  if (!accessToken) {
    return res.status(401).json({ error: `Access Token no proporcionado: ${accessToken}` });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: `Access Token inválido o expirado: ${error.message}` });
  }
}
