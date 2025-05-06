const usersController = {};

const User = require('../models/User');
const BaseController = require('./base.controller');
const bcrypt = require('bcrypt');

usersController.getUsers = async (req, res) => {
	try {
		const users = await User.find({ deletedAt: null }).select('-password'); 
	
		if (!users) {
			return res.status(404).json({ error: 'Users not found' });
		}

		res.json(users);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

usersController.getUser = async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.params.id, deletedAt: null }).select('-password');
  
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.json(user);
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

// Obtener Users bulk por ids
usersController.getUsersBulk = async (req, res) => {
	try {
	  const { ids } = req.body;
	  
	  if (!ids || !Array.isArray(ids)) {
		return res.status(400).json({ error: 'Se requiere un array de IDs en el cuerpo de la solicitud' });
	  }
  
	  const users = await User.find({ 
		_id: { $in: ids },
		deletedAt: null 
	  }).select('name email'); // Selecciona solo los campos necesarios
  
	  if (!users || users.length === 0) {
		return res.status(404).json({ error: 'Usuarios no encontrados' });
	  }
  
	  res.json(users);
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Error del servidor: ' + error.message });
	}
  };

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

		res.status(201).json({ message: 'User Saved', data: newUser });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
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
		return res.status(404).json({ error: 'User not found' });
	  }
  
	  // Convertir a objeto plano y eliminar password
	  const userObject = userUpdated.toObject();
	  delete userObject.password;
  
	  res.status(200).json({ message: 'User Updated', data: userObject });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Server Error: ' + error.message });
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
			return res.status(404).json({ error: 'User not found' });
		}
	
		res.json({ message: 'User Disabled', user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
};
  

module.exports = usersController;
