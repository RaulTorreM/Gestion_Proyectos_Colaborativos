const versionsController = {};

const Project = require('../models/Project');
const Version = require('../models/Version');
const UserStory = require('../models/UserStory');
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

//Obtener datos de muchas versiones a la vez
versionsController.getVersionsBulk = async (req, res) => {
	try {
	  const { ids } = req.body;
	  
	  if (!ids || !Array.isArray(ids)) {
		return res.status(400).json({ message: 'Se requiere un array de IDs en el cuerpo de la solicitud' });
	  }
  
	  const versions = await Version.find({ 
		_id: { $in: ids },
		deletedAt: null 
	  });
  
	  if (!versions) {
		return res.status(404).json({ message: 'Versiones no encontradas' });
	  }
  
	  res.json(versions);
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ message: 'Error del servidor', error: error.message });
	}
  };

versionsController.createVersion = async (req, res) => {
	try {
	  // Limpiar campos null o undefined para que usen sus valores por default en el modelo
	  const createData = BaseController.cleanAndAssignDefaults(req.body);
	  
	  // Crear y guardar la nueva versión
	  const newVersion = new Version(createData);
	  await newVersion.save();
  
	  // Agregar la nueva versión al proyecto relacionado
	  const project = await Project.findById(createData.projectId);
	  project.versions.push(newVersion._id);
	  await project.save();
  
	  // Actualizar las UserStories relacionadas
	  const userStoriesPromises = createData.userStories.map(async (userStoryId) => {
		await UserStory.findByIdAndUpdate(userStoryId, { versionId: newVersion._id });
	  });
  
	  await Promise.all(userStoriesPromises);
  
	  res.status(201).json({ message: 'Version Saved', version: newVersion });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ message: 'Server Error', error: error.message });
	}
};

versionsController.updateVersion = async (req, res) => {
	try {
	  // Limpiar y asignar defaults donde sea necesario
	  const updateData = BaseController.cleanAndAssignDefaults(req.body);
  
	  // Obtener las UserStories asociadas antes de actualizar la versión
	  const { userStories: userStoriesOld } = await Version.findById(req.params.id).select('userStories');
  
	  // Actualizar la versión y obtener la versión actualizada
	  const versionUpdated = await Version.findByIdAndUpdate(req.params.id, updateData, { new: true });
  
	  const userStoriesUpdated = versionUpdated.userStories;
  
	  // Crear operaciones para desvincular las antiguas UserStories
	  const unsetOperations = userStoriesOld.map(userStoryId => ({
		updateOne: {
		  filter: { _id: userStoryId },
		  update: { $unset: { versionId: null } }
		}
	  }));
  
	  // Crear operaciones para vincular las nuevas UserStories
	  const setOperations = userStoriesUpdated.map(userStoryId => ({
		updateOne: {
		  filter: { _id: userStoryId },
		  update: { $set: { versionId: versionUpdated._id } }
		}
	  }));
  
	  // Ejecutar todas las actualizaciones en batch
	  await UserStory.bulkWrite([...unsetOperations, ...setOperations]);
  
	  res.status(200).json({ message: 'Version Updated', version: versionUpdated });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ message: 'Server Error', error: error.message });
	}
};
  
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
