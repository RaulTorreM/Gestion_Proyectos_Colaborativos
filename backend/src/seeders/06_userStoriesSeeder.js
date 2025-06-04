const UserStory = require('../models/UserStory');
const Epic = require('../models/Epic');
const User = require('../models/User');
const Priority = require('../models/Priority'); // Cambiado de MoscowPriority a Priority

module.exports = async function seedUserStories() {
  try {
    // Busca algunos usuarios y épicas existentes
    const users = await User.find();
    const epics = await Epic.find();
    const priorities = await Priority.find({moscowPriority: { $exists: true }}); // Solo prioridades MoSCoW

    // Verifica si hay datos suficientes
    if (users.length === 0 || epics.length === 0 || priorities.length === 0) {
      console.error('❌ No hay suficientes datos para crear User Stories. Asegúrate de que hay Usuarios, Épicas y Prioridades.');
      return;
    }

    // Crear User Stories
    const userStories = [
      {
        epicId: epics[0]._id,
        name: 'Desarrollar la página de inicio',
        description: 'Implementar la página de inicio con la estructura básica.',
        priorityId: priorities.find(p => p.moscowPriority === 1)._id, // Usar priorityId
        status: 'Pendiente',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-05-15'),
        dueDate: new Date('2025-05-10'),
        assignedTo: [users[0]._id],
        authorUserId: users[0]._id,
      },
      {
        epicId: epics[1]._id,
        name: 'Implementar API REST',
        description: 'Crear la API REST para la comunicación con el frontend.',
        priorityId: priorities.find(p => p.moscowPriority === 2)._id, // Usar priorityId
        status: 'En Progreso',
        startDate: new Date('2025-05-10'),
        endDate: new Date('2025-05-20'),
        dueDate: new Date('2025-05-15'),
        assignedTo: [users[1]._id],
        authorUserId: users[1]._id,
      },
      {
        epicId: epics[0]._id,
        name: 'Desarrollar módulo de autenticación',
        description: 'Crear el sistema de autenticación de usuarios en la aplicación.',
        priorityId: priorities.find(p => p.moscowPriority === 3)._id, // Usar priorityId
        status: 'Completado',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-04-10'),
        dueDate: new Date('2025-04-05'),
        assignedTo: [users[2]._id],
        authorUserId: users[2]._id,
      },
    ];

    // Inserta las User Stories en la base de datos
    const insertedUserStories = await UserStory.insertMany(userStories);

    // Actualizar userStories en Epics relacionados
    for (let i = 0; i < insertedUserStories.length; i++) {
      const userStory = insertedUserStories[i];
      await Epic.findByIdAndUpdate(
        userStory.epicId,
        { $push: { userStories: userStory._id } }
      );
    }

    console.log(`✅ ${insertedUserStories.length} User Stories creadas con éxito.`);
  } catch (error) {
    console.error('❌ Error al insertar User Stories:', error);
  }
};