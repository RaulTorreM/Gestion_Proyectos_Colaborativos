const epicsController = {};

const Project = require('../models/Project');
const Epic = require('../models/Epic');
const BaseController = require('./base.controller');
const User = require('../models/User');
const Priority = require('../models/Priority');
const { getUserIdFromToken } = require('../lib/token');
const mongoose = require('mongoose');

epicsController.getEpics = async (req, res) => {
	try {
		const epics = await Epic.find({ deletedAt: null }); 

		if (!epics) {
			return res.status(404).json({ error: 'Epics not found' });
		}

		res.json(epics);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

epicsController.getEpic = async (req, res) => {
	try {
		const epic = await Epic.findOne({ _id: req.params.id, deletedAt: null });

		if (!epic) {
			return res.status(404).json({ error: 'Epic not found' });
		}

		res.json(epic);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

//Obtener las epicas por proyecto (Corregir para que el output sea solo las ids)
epicsController.getEpicsByProjects = async (req, res) => {
	try {
	  const epics = await Epic.find({ 
		projectId: req.params.id, 
		deletedAt: null 
	  }).populate('priorityId authorUserId'); // Mejorar con populate
	  
	  res.json(epics); // Siempre devolver array (aunque esté vacío)
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

epicsController.getEpicsBulk = async (req, res) => {
	try {
	  const { ids } = req.body;
  
	  if (!ids || !Array.isArray(ids)) {
		return res.status(400).json({ error: 'Se requiere un array de IDs en el cuerpo de la solicitud' });
	  }
  
	  const epics = await Epic.find({
		_id: { $in: ids },
		deletedAt: null
	  }).populate('priorityId');

	  if (!epics) {
		return res.status(404).json({ error: 'Épicas no encontradas' });
	  }
  
	  res.json(epics);
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Server Error: ' + error.message });
	}
};

epicsController.createEpic = async (req, res) => {
	try {

		// Validar projectId
		const projectExists = await Project.exists({ _id: req.body.projectId });
		if (!projectExists) {
		  return res.status(400).json({ error: 'Proyecto no válido' });
		}
	
		// Validar priorityId
		const priorityExists = await Priority.exists({ _id: req.body.priorityId });
		if (!priorityExists) {
		  return res.status(400).json({ error: 'Prioridad no válida' });
		}

		// Limpiar campos null o undefined para que usen sus valores por default en el modelo
		const createData = BaseController.cleanAndAssignDefaults(req.body);
		const userId = getUserIdFromToken(req);

		const user = await User.findById(userId);
		if (!user) {
		  return res.status(404).json({ error: 'User not found for this access token' });
		}

		createData.authorUserId = userId;

		const newEpic = new Epic(createData);
		await newEpic.save();

		// Agregar el id de la nueva epic al campo epics del Project 
		const project = await Project.findById(newEpic.projectId);
		project.epics.push(newEpic._id);
		await project.save();

		res.status(201).json({message: 'Epic Saved', data: newEpic});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

epicsController.updateEpic = async (req, res) => {
	try {
	  // Validar ObjectId primero
	  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return res.status(400).json({ error: "ID inválido" });
	  }
  
	  // Validar projectId si está presente
	  if (req.body.projectId) {
		const project = await Project.findById(req.body.projectId);
		if (!project) {
		  return res.status(400).json({ error: "Proyecto no válido" });
		}
	  }
  
	  // Validar priorityId
	  if (req.body.priorityId && !mongoose.Types.ObjectId.isValid(req.body.priorityId)) {
		return res.status(400).json({ error: "ID de prioridad inválido" });
	  }
  
	  const updateData = { ...req.body };
  
	  // Actualizar
	  const epicUpdated = await Epic.findByIdAndUpdate(
		req.params.id,
		updateData,
		{ new: true, runValidators: true }
	  ).populate('priorityId');
  
	  if (!epicUpdated) {
		return res.status(404).json({ error: 'Épica no encontrada' });
	  }
  
	  res.json(epicUpdated);
	} catch (error) {
	  console.error(error);
	  res.status(400).json({ 
		error: 'Error al actualizar',
		details: error.message 
	  });
	}
  };

epicsController.deleteEpic = async (req, res) => {
	try {
		const epic = await Epic.findByIdAndUpdate(
			req.params.id,
			{ deletedAt: new Date() },
			{ new: true }
		);
	
		if (!epic) {
			return res.status(404).json({ error: 'Epic not found' });
		}
	
		res.json({ message: 'Epic Disabled', data: epic });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

// Obtener user stories de una épica
epicsController.getEpicUserStories = async (req, res) => {
	try {
	  const epic = await Epic.findById(req.params.id)
		.populate('userStories');
	  
	  if (!epic) {
		return res.status(404).json({ error: 'Épica no encontrada' });
	  }
  
	  res.json(epic.userStories);
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Server Error: ' + error.message });
	}
  }
  
  // Obtener estadísticas de épicas por proyecto
  epicsController.getEpicsStatsByProject = async (req, res) => {
	try {
	  const stats = await Epic.aggregate([
		{
		  $match: {
			projectId: mongoose.Types.ObjectId(req.params.id),
			deletedAt: null
		  }
		},
		{
		  $group: {
			_id: "$status",
			count: { $sum: 1 },
			totalDuration: { $avg: { $subtract: ["$endDate", "$startDate"] } }
		  }
		}
	  ]);
  
	  res.json(stats);
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Server Error: ' + error.message });
	}
  }

module.exports = epicsController;
