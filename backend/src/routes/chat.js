const express = require('express');
const router = express.Router();
const { validateToken } = require('../middlewares/validateToken');
const Message = require('../models/Message');
const User = require('../models/User');

// Obtener lista de usuarios para el chat
router.get('/users', validateToken, async (req, res) => {
  try {
    const currentUserId = req.userId;

    // Traer todos los usuarios excepto el actual
    const users = await User.find({
      _id: { $ne: currentUserId },
      deletedAt: null
    }).select('name avatar settings.theme lastLogin');

    // Obtener el usuario actual
    const currentUser = await User.findById(currentUserId)
      .select('name avatar settings.theme lastLogin');

    // Mapear usuarios con estado online/offline
    const usersWithStatus = users.map(user => {
      const isOnline = user.lastLogin &&
        (new Date() - new Date(user.lastLogin)) < 5 * 60 * 1000; // últimos 5 min

      return {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        status: isOnline ? 'online' : 'offline',
        theme: user.settings?.theme || 'dark'
      };
    });

    // Agrega al usuario actual primero en la lista
    usersWithStatus.unshift({
      id: currentUser._id,
      name: `${currentUser.name} (Tú)`,
      avatar: currentUser.avatar,
      status: 'online',
      theme: currentUser.settings?.theme || 'dark',
      isCurrentUser: true
    });

    res.json(usersWithStatus);
  } catch (error) {
    console.error('Error al obtener usuarios del chat:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener mensajes entre el usuario actual y otro usuario
router.get('/messages/:userId', validateToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { from: req.userId, to: req.params.userId },
        { from: req.params.userId, to: req.userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('from', 'name avatar'); // Populamos el remitente con nombre y avatar

    res.json(messages.map(msg => ({
      from: msg.from._id.toString() === req.userId ? 'Yo' : msg.from.name,
      content: msg.content,
      timestamp: msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// Enviar mensaje
router.post('/messages', validateToken, async (req, res) => {
  try {
    const { to, content } = req.body;

    const newMessage = new Message({
      from: req.userId,
      to,
      content
    });

    await newMessage.save();

    res.status(201).json({
      from: 'Yo',
      content: newMessage.content,
      timestamp: newMessage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
});

module.exports = router;
