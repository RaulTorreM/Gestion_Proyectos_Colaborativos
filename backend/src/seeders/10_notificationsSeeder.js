const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');

module.exports = async function seedNotifications() {
  try {
    // Busca algunos usuarios existentes
    const users = await User.find();  // Asegúrate de que los usuarios estén creados previamente

    // Verifica si hay usuarios suficientes
    if (users.length === 0) {
      console.error('❌ No hay suficientes usuarios para crear notificaciones. Asegúrate de que haya usuarios.');
      return;
    }

    // Crear notificaciones
    const notifications = [
      {
        type: 'info',
        message: 'Esta es una notificación informativa.',
        userId: users[0]._id,  // Asigna el primer usuario
      },
      {
        type: 'warning',
        message: 'Esto es un mensaje de advertencia.',
        userId: users[1]._id,  // Asigna el segundo usuario
      },
      {
        type: 'success',
        message: 'Operación exitosa.',
        userId: users[2]._id,  // Asigna el tercer usuario
      },
      {
        type: 'error',
        message: 'Ocurrió un error inesperado.',
        userId: users[0]._id,  // Asigna el primer usuario
      },
    ];

    // Inserta las notificaciones en la base de datos
    await Notification.insertMany(notifications);

  } catch (error) {
    console.error('❌ Error al insertar notificaciones:', error);
  }
};
