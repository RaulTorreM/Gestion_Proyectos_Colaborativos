const UserStory = require('../models/UserStory');
const Epic = require('../models/Epic');
const User = require('../models/User');
const MoscowPriority = require('../models/Priority');

module.exports = async function seedUserStories() {
	try {
		// Busca algunos usuarios y épicas existentes
		const users = await User.find();  // Asegúrate de que los usuarios estén creados previamente
		const epics = await Epic.find();  // Asegúrate de que las épicas estén creadas previamente
		const priorities = await MoscowPriority.find();  // Asegúrate de que las prioridades estén creadas previamente

		// Verifica si hay datos suficientes
		if (users.length === 0 || epics.length === 0 || priorities.length === 0) {
			console.error('❌ No hay suficientes datos para crear User Stories. Asegúrate de que hay Usuarios, Épicas y Prioridades.');
			return;
		}

		// Crear User Stories
		const userStories = [
			{
				epicId: epics[0]._id,  // Asigna la primera épica
				name: 'Desarrollar la página de inicio',
				description: 'Implementar la página de inicio con la estructura básica.',
				priorityId: priorities[0]._id,  
				status: 'Pendiente',
				startDate: new Date('2025-05-01'),
				endDate: new Date('2025-05-15'),
				dueDate: new Date('2025-05-10'),
				assignedTo: [users[0]._id],
				authorUserId: users[0]._id,  // El usuario que crea la UserStory
			},
			{
				epicId: epics[1]._id,  // Asigna la segunda épica
				name: 'Implementar API REST',
				description: 'Crear la API REST para la comunicación con el frontend.',
				priorityId: priorities[1]._id,
				status: 'En Progreso',
				startDate: new Date('2025-05-10'),
				endDate: new Date('2025-05-20'),
				dueDate: new Date('2025-05-15'),
				assignedTo: [
					{ userId: users[1]._id},
				],
				authorUserId: users[1]._id,  // El usuario que crea la UserStory
			},
			{
				epicId: epics[0]._id,  // Asigna la primera épica
				name: 'Desarrollar módulo de autenticación',
				description: 'Crear el sistema de autenticación de usuarios en la aplicación.',
				priorityId: priorities[2]._id,
				status: 'Completado',
				startDate: new Date('2025-04-01'),
				endDate: new Date('2025-04-10'),
				dueDate: new Date('2025-04-05'),
				assignedTo: [
					{ userId: users[2]._id},
				],
				authorUserId: users[2]._id,  // El usuario que crea la UserStory
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
	} catch (error) {
		console.error('❌ Error al insertar User Stories:', error);
	}
};
