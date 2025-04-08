const UserStory = require('../models/UserStory');
const Epic = require('../models/Epic');
const User = require('../models/User');
const MoscowPriority = require('../models/MoscowPriority');
const mongoose = require('mongoose');

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
			epic: epics[0]._id,  // Asigna la primera épica
			title: 'Desarrollar la página de inicio',
			description: 'Implementar la página de inicio con la estructura básica.',
			moscowPriorityId: priorities[0].moscowPriorityId,  // Asigna la primera prioridad
			status: 'Pendiente',
			startDate: new Date('2025-05-01'),
			endDate: new Date('2025-05-15'),
			dueDate: new Date('2025-05-10'),
			assignedTo: [users[0]._id],  // Asigna el primer usuario
			createdBy: users[0]._id,  // El usuario que crea la UserStory
		},
		{
			epic: epics[1]._id,  // Asigna la segunda épica
			title: 'Implementar API REST',
			description: 'Crear la API REST para la comunicación con el frontend.',
			moscowPriorityId: priorities[1].moscowPriorityId,  // Asigna la segunda prioridad
			status: 'En Progreso',
			startDate: new Date('2025-05-10'),
			endDate: new Date('2025-05-20'),
			dueDate: new Date('2025-05-15'),
			assignedTo: [users[1]._id],  // Asigna el segundo usuario
			createdBy: users[1]._id,  // El usuario que crea la UserStory
		},
		{
			epic: epics[0]._id,  // Asigna la primera épica
			title: 'Desarrollar módulo de autenticación',
			description: 'Crear el sistema de autenticación de usuarios en la aplicación.',
			moscowPriorityId: priorities[2].moscowPriorityId,  // Asigna la tercera prioridad
			status: 'Completado',
			startDate: new Date('2025-04-01'),
			endDate: new Date('2025-04-10'),
			dueDate: new Date('2025-04-05'),
			assignedTo: [users[2]._id],  // Asigna el tercer usuario
			createdBy: users[2]._id,  // El usuario que crea la UserStory
		},
		];

		// Inserta las User Stories en la base de datos
		await UserStory.insertMany(userStories);
		console.log('✅ User Stories insertadas correctamente.');

	} catch (error) {
		console.error('❌ Error al insertar User Stories:', error);
	}
};
