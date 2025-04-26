const usersController = {};

const User = require('../models/User');
const BaseController = require('./base.controller');
const bcrypt = require('bcrypt');

usersController.getUsers = async (req, res) => {
	const users = await User.find().select('-password'); 
	res.json(users);
}

usersController.getUser = async (req, res) => {
	const user = await User.findById(req.params.id).select('-password');
	res.json(user);
}

usersController.createUser = async (req, res) => {
	try {
		// Hashear password
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		req.body.password = hashedPassword;

		// Limpiar campos null o undefined
		const createData = BaseController.cleanUndefinedOrNull(req.body);

		// Crear usuario
		const newUser = new User(createData);
		await newUser.save();

		res.status(201).json({ message: 'User Saved', user: newUser });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
};
usersController.updateUser = async (req, res) => {
	try {
	  // Hashear password
	  if (req.body.password) {
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		req.body.password = hashedPassword;
	  }
  
	  // Limpiar campos null o undefined
	  const updateData = BaseController.cleanUndefinedOrNull(req.body);
  
	  // Actualizar usuario y devolver el actualizado
	  const userUpdated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
  
	  // Validar si se encontró el usuario
	  if (!userUpdated) {
		return res.status(404).json({ message: 'User not found' });
	  }
  
	  // Convertir a objeto plano y eliminar password y __v
	  const userObject = userUpdated.toObject();
	  delete userObject.password;
	  delete userObject.__v;
  
	  res.status(200).json({ message: 'User Updated', user: userObject });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ message: 'Server Error', error: error.message });
	}
};

usersController.deleteUser = async (req, res) => {
	await User.findByIdAndDelete(req.params.id)
	res.json({ message: 'User deleted' })
}

module.exports = usersController;
