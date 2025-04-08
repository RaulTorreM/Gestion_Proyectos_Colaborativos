const User = require('../models/User');
const bcrypt = require('bcrypt'); // para encriptar contraseñas

module.exports = async function seedUsers() {
	const users = [
	{
		username: 'Josué García',
		email: 'josue@example.com',
		password: await bcrypt.hash('josue123', 10),
		settings: {
			theme: "dark",
			language: "es"
		},
		preferences: {
			fontSize: "medium",
			sidebarCollapsed: false
		},
	},
	{
		username: 'Raúl Torre',
		email: 'raul@example.com',
		password: await bcrypt.hash('raul123', 10),
		settings: {
			theme: "dark",
			language: "en"
		},
		preferences: {
			fontSize: "medium",
			sidebarCollapsed: false
		},
	},
	{
		username: 'David Contreras',
		email: 'david@example.com',
		password: await bcrypt.hash('david123', 10),
		settings: {
			theme: "light",
			language: "es"
		},
		preferences: {
			fontSize: "small",
			sidebarCollapsed: false
		},
	}
	];

	try {
		await User.insertMany(users);
	} catch (error) {
		console.error('❌ Error al insertar las prioridades MoSCoW:', error);
	}
};
