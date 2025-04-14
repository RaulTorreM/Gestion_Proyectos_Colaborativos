const UserStory = require('../models/UserStory');
const Project = require('../models/Project');
const User = require('../models/User');
const Version = require('../models/Version');

module.exports = async function seedUserStories() {
	try {
		const users = await User.find();
		const projects = await Project.find();
		const userStories = await UserStory.find();

		if (users.length === 0 || projects.length === 0 || userStories.length === 0) {
			console.error('❌ No hay suficientes datos para crear Versions. Asegúrate de que hay Usuarios, Proyectos e Historias de Usuario.');
			return;
		}

		const versions = [
			{
				name: '1.0.0',
				description: 'Primera versión de Migración de BD.',
				status: 'Planeado',
				startDate: new Date('2025-05-01'),
				releaseDate: new Date('2025-06-01'),
				projectId: projects[0]._id,
				userStories: [userStories[0]._id],
				authorUserId: users[0]._id,
			},
			{
				name: '1.0.5',
				description: 'Segunda versión de Delivery de Comidas app móvil.',
				status: 'En Progreso',
				startDate: new Date('2025-05-01'),
				releaseDate: new Date('2025-06-01'),
				projectId: projects[1]._id,
				userStories: [userStories[1]._id, userStories[2]._id],
				authorUserId: users[0]._id,
			},
		];

		const insertedVersions = await Version.insertMany(versions);

		// Actualiza versionId en las User Stories relacionadas
		for (let i = 0; i < insertedVersions.length; i++) {
			const version = insertedVersions[i];

			await UserStory.updateMany(
				{ _id: { $in: versions[i].userStories } },
				{ $set: { versionId: version._id } }
			);
		}

		console.log('✅ Seed de versiones y actualización de userStories completado.');

	} catch (error) {
		console.error('❌ Error al insertar Versions:', error);
	}
};
