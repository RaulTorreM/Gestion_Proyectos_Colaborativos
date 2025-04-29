const versionsController = {};

const Project = require('../models/Project');
const Version = require('../models/Version');
const BaseController = require('./base.controller');

versionsController.getVersions = async (req, res) => {
	try {
		const versions = await Version.find({ deletedAt: null }); 

		if (!versions) {
			return res.status(404).json({ message: 'Versions not found' });
		}

		res.json(versions);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

versionsController.getVersion = async (req, res) => {
	try {
		const version = await Version.findOne({ _id: req.params.id, deletedAt: null });

		if (!version) {
			return res.status(404).json({ message: 'Version not found' });
		}

		res.json(version);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

versionsController.createVersion = async (req, res) => {
	try {
		// Limpiar campos null o undefined para que usen sus valores por default en el modelo
		const createData = BaseController.cleanAndAssignDefaults(req.body);
		
		const newVersion = new Version(createData);
		await newVersion.save();

		// Agregar el id de la nueva version al campo versions del Project 
		const project = await Project.findById(createData.projectId);
		project.versions.push(newVersion._id);
		await project.save();

		res.status(201).json({message: 'Version Saved', version: newVersion});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

versionsController.updateVersion = async (req, res) => {
	try {
		// Limpiar y asignar defaults donde sea necesario
		const updateData = BaseController.cleanAndAssignDefaults(req.body);
	
		const versionUpdated = await Version.findByIdAndUpdate(req.params.id, updateData, { new: true });
	
		if (!versionUpdated) {
			return res.status(404).json({ message: 'Version not found' });
		}
	
		const versionObject = versionUpdated.toObject();
	
		res.status(200).json({ message: 'Version Updated', user: versionObject });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

versionsController.deleteVersion = async (req, res) => {
	try {
		const version = await Version.findByIdAndUpdate(
			req.params.id,
			{ deletedAt: new Date() },
			{ new: true }
		);
	
		if (!version) {
			return res.status(404).json({ message: 'Version not found' });
		}
	
		res.json({ message: 'Version Disabled', version });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

module.exports = versionsController;
