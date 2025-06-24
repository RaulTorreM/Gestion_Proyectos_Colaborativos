const versionsController = {};

const User = require('../models/User');
const Project = require('../models/Project');
const Version = require('../models/Version');
const UserStory = require('../models/UserStory');
const BaseController = require('./base.controller');
const { getUserIdFromToken } = require('../lib/token');

// Obtener todas las versiones
versionsController.getVersions = async (req, res) => {
	try {
		const versions = await Version.find({ deletedAt: null })
			.populate('userStories');

		if (!versions) {
			return res.status(404).json({ error: 'Versions not found' });
		}

		res.json(versions);
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
};

// Obtener una versión por ID
versionsController.getVersion = async (req, res) => {
	try {
		const version = await Version.findOne({ _id: req.params.id, deletedAt: null })
			.populate('userStories');

		if (!version) {
			return res.status(404).json({ error: 'Version not found' });
		}

		res.json(version);
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
};

// Obtener múltiples versiones por ID
versionsController.getVersionsBulk = async (req, res) => {
	try {
		const { ids } = req.body;

		if (!ids || !Array.isArray(ids)) {
			return res.status(400).json({ message: 'Se requiere un array de IDs en el cuerpo de la solicitud' });
		}

		const versions = await Version.find({
			_id: { $in: ids },
			deletedAt: null
		}).populate('userStories');

		if (!versions) {
			return res.status(404).json({ message: 'Versiones no encontradas' });
		}

		res.json(versions);
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ message: 'Error del servidor', error: error.message });
	}
};

// Crear una nueva versión
versionsController.createVersion = async (req, res) => {
	try {
		const createData = BaseController.cleanAndAssignDefaults(req.body);

		const userId = getUserIdFromToken(req);
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: 'User not found for this access token' });
		}

		createData.authorUserId = userId;

		// Normalizar userStories a solo IDs
		const userStoryIds = (createData.userStories || []).map(s =>
			typeof s === 'string' ? s : s.id || s._id
		);

		createData.userStories = userStoryIds;

		const newVersion = new Version(createData);
		await newVersion.save();

		await Project.findByIdAndUpdate(createData.projectId, {
			$push: { versions: newVersion._id }
		});

		await UserStory.updateMany(
			{ _id: { $in: userStoryIds } },
			{ $set: { versionId: newVersion._id } }
		);

		const populated = await Version.findById(newVersion._id).populate('userStories');

		res.status(201).json({ message: 'Version Saved', version: populated });
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
};

// Actualizar una versión existente
versionsController.updateVersion = async (req, res) => {
	try {
		const updateData = BaseController.cleanAndAssignDefaults(req.body);

		// Normalizar userStories a solo IDs
		if (Array.isArray(updateData.userStories)) {
			updateData.userStories = updateData.userStories.map(s =>
				typeof s === 'string' ? s : s.id || s._id
			);
		}

		const { userStories: userStoriesOld } = await Version.findById(req.params.id).select('userStories');
		const versionUpdated = await Version.findByIdAndUpdate(req.params.id, updateData, { new: true });
		const userStoriesUpdated = versionUpdated.userStories;

		const unsetOperations = userStoriesOld.map(userStoryId => ({
			updateOne: {
				filter: { _id: userStoryId },
				update: { $unset: { versionId: "" } }
			}
		}));

		const setOperations = userStoriesUpdated.map(userStoryId => ({
			updateOne: {
				filter: { _id: userStoryId },
				update: { $set: { versionId: versionUpdated._id } }
			}
		}));

		await UserStory.bulkWrite([...unsetOperations, ...setOperations]);

		const populated = await Version.findById(versionUpdated._id).populate('userStories');

		res.status(200).json({ message: 'Version Updated', data: populated });
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
};

// Eliminar una versión (soft delete)
versionsController.deleteVersion = async (req, res) => {
	try {
		const version = await Version.findByIdAndUpdate(
			req.params.id,
			{ deletedAt: new Date() },
			{ new: true }
		);

		if (!version) {
			return res.status(404).json({ error: 'Version not found' });
		}

		res.json({ message: 'Version Disabled', version });
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
};

// Obtener versiones por proyecto
versionsController.getVersionsByProject = async (req, res) => {
	try {
		const { projectId } = req.params;

		// Verificar que el proyecto existe
		const project = await Project.findById(projectId);
		if (!project) {
			return res.status(404).json({ error: 'Project not found' });
		}

		const versions = await Version.find({
			projectId,
			deletedAt: null
		}).populate('userStories');

		// Devolver array vacío si no hay versiones, no error 404
		res.json(versions);
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
};

module.exports = versionsController;
