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

		// Actualizar versionId en UserStories y versions en Projects relacionados
		const updates = insertedVersions.map(async (version, i) => {
			// Actualizar UserStories relacionadas
			await UserStory.updateMany(
			  { _id: { $in: versions[i].userStories } },
			  { $set: { versionId: version._id } }
			);
			
			// Actualizar Project relacionado
			const project = await Project.findById(versions[i].projectId);
			if (!project) {
			  console.warn(`⚠️ Proyecto con ID ${versions[i].projectId} no encontrado`);
			  return;
			}
		  
			project.versions.push(version._id);
			await project.save();
		});
		
		// Ejecutar todo en paralelo
		await Promise.all(updates);

		console.log('✅ Seed de versiones y actualización de userStories completado.');

	} catch (error) {
		console.error('❌ Error al insertar Versions:', error);
	}
};
