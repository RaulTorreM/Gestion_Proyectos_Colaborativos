const prioritiesController = {};

const Priority = require('../models/Priority');
const BaseController = require('./base.controller');

prioritiesController.getPriorities = async (req, res) => {
	try {
		const priorities = await Priority.find({ deletedAt: null }); 

		if (!priorities) {
			return res.status(404).json({ error: 'Priorities not found' });
		}

		res.json(priorities);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

prioritiesController.getPriority = async (req, res) => {
	try {
		const priority = await Priority.findOne({ _id: req.params.id, deletedAt: null });

		if (!priority) {
			return res.status(404).json({ error: 'Priority not found' });
		}

		res.json(priority);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

prioritiesController.getPriorityByMoscowPriority = async (req, res) => {
	try {
		const moscowPriority = await Priority.findOne({ moscowPriority: req.params.moscowPriority });

		if (!moscowPriority) {
			return res.status(404).json({ error: 'Moscow Priority not found' });
		}

		res.json(moscowPriority);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

//Obtener los detalles de varias priorities a la vez
prioritiesController.getPrioritiesBulk = async (req, res) => {
	try {
	  const { ids } = req.body;
	  
	  if (!ids || !Array.isArray(ids)) {
		return res.status(400).json({ error: 'Se requiere un array de IDs en el cuerpo de la solicitud' });
	  }
  
	  const priorities = await Priority.find({ 
		_id: { $in: ids },
		deletedAt: null 
	  });
  
	  if (!priorities) {
		return res.status(404).json({ error: 'Prioridades no encontradas' });
	  }
  
	  res.json(priorities);
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Server Error: ' + error.message });
	}
};


prioritiesController.createPriority = async (req, res) => {
	try {
		// Limpiar campos null o undefined para que usen sus valores por default en el modelo
		const createData = BaseController.cleanAndAssignDefaults(req.body);

		const newPriority = new Priority(createData);
		await newPriority.save();

		res.status(201).json({message: 'Priority Saved', data: newPriority});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

prioritiesController.updatePriority = async (req, res) => {
	try {
		// Limpiar y asignar defaults donde sea necesario
		const updateData = BaseController.cleanAndAssignDefaults(req.body);
	
		const priorityUpdated = await Priority.findByIdAndUpdate(req.params.id, updateData, { new: true });
	
		if (!priorityUpdated) {
			return res.status(404).json({ error: 'Priority not found' });
		}
	
		const priorityObject = priorityUpdated.toObject();
	
		res.status(200).json({ message: 'Priority Updated', data: priorityObject });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

prioritiesController.deletePriority = async (req, res) => {
	try {
		const priority = await Priority.findByIdAndUpdate(
			req.params.id,
			{ deletedAt: new Date() },
			{ new: true }
		);
	
		if (!priority) {
			return res.status(404).json({ error: 'Priority not found' });
		}
	
		res.json({ message: 'Priority Disabled', priority });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

module.exports = prioritiesController;
