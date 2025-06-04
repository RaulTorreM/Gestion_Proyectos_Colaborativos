const User = require('../models/User');

// Obtener todos los usuarios (excepto el actual si quieres)
const getChatUsers = async (req, res) => {
  try {
    const currentUserId = req.user?._id; // Asumiendo autenticación con JWT/Middleware

    const users = await User.find({
      _id: { $ne: currentUserId },
      deletedAt: null // evitar usuarios eliminados lógicamente
    }).select('_id name avatar email');

    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener usuarios para chat:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { getChatUsers };
