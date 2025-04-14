const userControllers = {};

const User = require('../models/User');
const bcrypt = require('bcrypt');

userControllers.getUsers = async (req, res) => {
	const users = await User.find(); 
	res.json(users)
}

userControllers.getUser = async (req, res) => {
	const user = await User.findById(req.params.id)
	res.json(user)
}

userControllers.createUser = async (req, res) => {
	const { name, email, password, settings, preferences} = req.body 

	let createData = { name, email, password, avatar, settings, preferences};

	if (password) {
		const hashedPassword = await bcrypt.hash(password, 10);
		createData.password = hashedPassword;
	}

	const newUser = new User(createData)

	await newUser.save();

	res.json({ message: 'User Saved' });
}

userControllers.updateUser = async (req, res) => {
	const { name, email, password, settings, preferences} = req.body 

	let updateData = { name, email, avatar, settings, preferences };

	if (password) {
		const hashedPassword = await bcrypt.hash(password, 10);
		updateData.password = hashedPassword;
	}

	await User.findByIdAndUpdate(
		req.params.id, 
		updateData, // Datos a actualizar
	);

	res.json({ message: 'User updated' })
}

userControllers.deleteUser = async (req, res) => {
	await User.findByIdAndDelete(req.params.id)
	res.json({ message: 'User deleted' })
}

module.exports = userControllers;
