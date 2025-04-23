const UserStory = require('../models/UserStory');
const User = require('../models/User');
const Comment = require('../models/Comment');

module.exports = async function seedComments() {
	try {
		// Buscar usuarios e historias de usuario existentes
		const users = await User.find(); 
		const userStories = await UserStory.find();

		// Verificar si hay suficientes datos
		if (users.length < 3 || userStories.length < 2) {
			console.error('❌ No hay suficientes datos para crear Comments. Asegúrate de tener al menos 3 Usuarios y 2 Historias de Usuario.');
			return;
		}

		// Crear comentarios
		const comments = [
			{
				userStoryId: userStories[0]._id, 
				authorUserId: users[0]._id,
				text: 'Tu avance está mal.',
				mentions: [users[1]._id],
			},
			{
				userStoryId: userStories[1]._id, 
				authorUserId: users[1]._id,
				text: 'Recuerda actualizar tu progreso.',
				mentions: [users[0]._id, users[2]._id],
			}
		];

		// Insertar los comentarios
		await Comment.insertMany(comments);
		console.log('✅ Comentarios insertados exitosamente.');

	} catch (error) {
		console.error('❌ Error al insertar comentarios:', error);
	}
};
