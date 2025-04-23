const Notification = require('../models/Notification');
const User = require('../models/User');
const Comment = require('../models/Comment');

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
        userId: users[0]._id,  // Asigna el primer usuario
        type: 'mention',
        title: 'TEST1',
        message: 'Esta es una notificación informativa.',
        entityType: "Comments",
        entityId: comments[0]._id,
      },
      {
        userId: users[1]._id,  // Asigna el segundo usuario
        type: 'assignment',
        title: 'TEST2',
        message: 'Esto es un mensaje de advertencia.',
        entityType: "Comments",
        entityId: comments[0]._id,
      },
      {
        userId: users[2]._id,  // Asigna el tercer usuario
        type: 'status_change',
        title: 'TEST3',
        message: 'Operación exitosa.',
        entityType: "Comments",
        entityId: comments[0]._id,
      },
      {
        userId: users[0]._id,  // Asigna el primer usuario
        type: 'comment',
        title: 'TEST4',
        message: 'Ocurrió un error inesperado.',
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
