const epicsController = {};

const Project = require('../models/Project');
const Epic = require('../models/Epic');
const BaseController = require('./base.controller');

epicsController.getEpics = async (req, res) => {
	try {
		const epics = await Epic.find({ deletedAt: null }); 

		if (!epics) {
			return res.status(404).json({ message: 'Epics not found' });
		}

		res.json(epics);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

epicsController.getEpic = async (req, res) => {
	try {
		const epic = await Epic.findOne({ _id: req.params.id, deletedAt: null });

		if (!epic) {
			return res.status(404).json({ message: 'Epic not found' });
		}

		res.json(epic);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

epicsController.createEpic = async (req, res) => {
	try {
		// Limpiar campos null o undefined para que usen sus valores por default en el modelo
		const createData = BaseController.cleanAndAssignDefaults(req.body);

		const newEpic = new Epic(createData);
		await newEpic.save();

		// Agregar el id de la nueva epic al campo epics del Project 
		const project = await Project.findById(newEpic.projectId);
		project.epics.push(newEpic._id);
		await project.save();

		res.status(201).json({message: 'Epic Saved', project: newEpic});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

epicsController.updateEpic = async (req, res) => {
	try {
		// Limpiar y asignar defaults donde sea necesario
		const updateData = BaseController.cleanAndAssignDefaults(req.body);
	
		const epicUpdated = await Epic.findByIdAndUpdate(req.params.id, updateData, { new: true });
	
		if (!epicUpdated) {
			return res.status(404).json({ message: 'Epic not found' });
		}
	
		const epicObject = epicUpdated.toObject();
	
		res.status(200).json({ message: 'Epic Updated', user: epicObject });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

epicsController.deleteEpic = async (req, res) => {
	try {
		const epic = await Epic.findByIdAndUpdate(
			req.params.id,
			{ deletedAt: new Date() },
			{ new: true }
		);
	
		if (!epic) {
			return res.status(404).json({ message: 'Epic not found' });
		}
	
		res.json({ message: 'Epic Disabled', epic });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

module.exports = epicsController;
