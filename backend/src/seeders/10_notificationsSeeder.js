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
        description: 'Esta es una notificación informativa.',
        user: users[0]._id,  // Asigna el primer usuario
      },
      {
        type: 'warning',
        description: 'Esto es un mensaje de advertencia.',
        user: users[1]._id,  // Asigna el segundo usuario
      },
      {
        type: 'success',
        description: 'Operación exitosa.',
        user: users[2]._id,  // Asigna el tercer usuario
      },
      {
        type: 'error',
        description: 'Ocurrió un error inesperado.',
        user: users[0]._id,  // Asigna el primer usuario
      },
    ];

    // Inserta las notificaciones en la base de datos
    await Notification.insertMany(notifications);
    console.log('✅ Notificaciones insertadas correctamente.');

  } catch (error) {
    console.error('❌ Error al insertar notificaciones:', error);
  }
};
