const User = require('../models/User');
const bcrypt = require('bcrypt'); // para encriptar contraseñas

module.exports = async function seedUsers() {
	const users = [
	{
		name: 'Josué García',
		email: 'josue@example.com',
		password: await bcrypt.hash('josue123', 10),
		avatar: "josue.png",
		settings: {
			notifications: {
				email: false,
				push: true
			},
			theme: "dark"
		},
		preferences: {
			language: "es",
			timezone: "America/Lima"
		},
	},
	{
		name: 'Raúl Torre',
		email: 'raul@example.com',
		password: await bcrypt.hash('raul123', 10),
		avatar: "raul.png",
		settings: {
			notifications: {
				email: false,
				push: true
			},
			theme: "dark"
		},
		preferences: {
			language: "es",
			timezone: "America/Lima"
		},
	},
	{
		name: 'David Contreras',
		email: 'david@example.com',
		password: await bcrypt.hash('david123', 10),
		avatar: "david.png",
		settings: {
			notifications: {
				email: true,
				push: true
			},
			theme: "light"
		},
		preferences: {
			language: "en",
			timezone: "America/New_York"
		},
	}
	];

	try {
		await User.insertMany(users);
	} catch (error) {
		console.error('❌ Error al insertar las prioridades MoSCoW:', error);
	}
};
