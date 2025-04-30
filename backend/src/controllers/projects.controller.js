const projectsController = {};

const User = require('../models/User');
const Project = require('../models/Project');
const BaseController = require('./base.controller');

projectsController.getProjects = async (req, res) => {
	try {
		const projects = await Project.find({ deletedAt: null }); 

		if (!projects) {
			return res.status(404).json({ message: 'Projects not found' });
		}

		res.json(projects);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

projectsController.getProject = async (req, res) => {
	try {
		const project = await Project.findOne({ _id: req.params.id, deletedAt: null });

		if (!project) {
			return res.status(404).json({ message: 'Project not found' });
		}

		res.json(project);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

projectsController.createProject = async (req, res) => {
	try {
		// Limpiar campos null o undefined para que usen sus valores por default en el modelo
		const createData = BaseController.cleanAndAssignDefaults(req.body);

		const newProject = new Project(createData);
		await newProject.save();

		// Agregar el id del nuevo project al campo projects del User 
		const user = await User.findById(newProject.authorUserId);
		user.projects.push(newProject._id);
		await user.save();
		
		res.status(201).json({message: 'Project Saved', project: newProject});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

projectsController.updateProject = async (req, res) => {
	try {
		// Limpiar y asignar defaults donde sea necesario
		const updateData = BaseController.cleanAndAssignDefaults(req.body);
	
		const projectUpdated = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
	
		if (!projectUpdated) {
			return res.status(404).json({ message: 'Project not found' });
		}
	
		const projectObject = projectUpdated.toObject();
	
		res.status(200).json({ message: 'Project Updated', user: projectObject });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

projectsController.deleteProject = async (req, res) => {
	try {
		const project = await Project.findByIdAndUpdate(
			req.params.id,
			{ deletedAt: new Date() },
			{ new: true }
		);
	
		if (!project) {
			return res.status(404).json({ message: 'Project not found' });
		}
	
		res.json({ message: 'Project Disabled', project });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
};
  

module.exports = projectsController;
