const usersController = {};

const User = require('../models/User');
const BaseController = require('./base.controller');
const bcrypt = require('bcrypt');

usersController.getUsers = async (req, res) => {
	try {
		const users = await User.find({ deletedAt: null }).select('-password'); 
	
		if (!users) {
			return res.status(404).json({ message: 'Users not found' });
		}

		res.json(users);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

usersController.getUser = async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.params.id, deletedAt: null }).select('-password');
  
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json(user);
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

usersController.createUser = async (req, res) => {
	try {
		// Hashear password
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		req.body.password = hashedPassword;

		// Limpiar campos null o undefined para que usen sus valores por default en el modelo
		const createData = BaseController.cleanAndAssignDefaults(req.body);

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
  
	  // Definir defaults específicos para campos que explícitamente envían null
	  const defaults = {
		avatar: 'default_avatar.png',
	  };
  
	  // Limpiar y asignar defaults donde sea necesario
	  const updateData = BaseController.cleanAndAssignDefaults(req.body, defaults);
  
	  // Actualizar usuario y devolver el actualizado
	  const userUpdated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
  
	  // Validar si se encontró el usuario
	  if (!userUpdated) {
		return res.status(404).json({ message: 'User not found' });
	  }
  
	  // Convertir a objeto plano y eliminar password
	  const userObject = userUpdated.toObject();
	  delete userObject.password;
  
	  res.status(200).json({ message: 'User Updated', user: userObject });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ message: 'Server Error', error: error.message });
	}
};

usersController.deleteUser = async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ deletedAt: new Date() },
			{ new: true }
		);
	
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
	
		res.json({ message: 'User Disabled', user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
};
  

module.exports = usersController;
