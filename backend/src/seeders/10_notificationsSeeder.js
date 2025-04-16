const Notification = require('../models/Notifications');
const User = require('../models/Users');
const mongoose = require('mongoose');
const Comment = require('../models/Comments');

module.exports = async function seedNotifications() {
  try {
    // Busca algunos usuarios existentes
    const users = await User.find();  // Asegúrate de que los usuarios estén creados previamente
    const comments = await Comment.find();

    // Verifica si hay usuarios suficientes
    if (users.length === 0) {
      console.error('❌ No hay suficientes usuarios para crear notificaciones. Asegúrate de que haya usuarios.');
      return;
    }

    // Crear notificaciones
    const notifications = [
      {
        type: 'mention',
        title: 'TEST1',
        message: 'Esta es una notificación informativa.',
        userId: users[0]._id,  // Asigna el primer usuario
        entityType: "Comments",
        entityId: comments[0]._id,
      },
      {
        type: 'assignment',
        title: 'TEST2',
        message: 'Esto es un mensaje de advertencia.',
        userId: users[1]._id,  // Asigna el segundo usuario
        entityType: "Comments",
        entityId: comments[0]._id,
      },
      {
        title: 'TEST3',
        type: 'status_change',
        message: 'Operación exitosa.',
        userId: users[2]._id,  // Asigna el tercer usuario
        entityType: "Comments",
        entityId: comments[0]._id,
      },
      {
        type: 'comment',
        title: 'TEST4',
        message: 'Ocurrió un error inesperado.',
        userId: users[0]._id,  // Asigna el primer usuario
        entityType: "Comments",
        entityId: comments[0]._id,
      },
    ];

    // Inserta las notificaciones en la base de datos
    await Notification.insertMany(notifications);

  } catch (error) {
    console.error('❌ Error al insertar notificaciones:', error);
  }
};
