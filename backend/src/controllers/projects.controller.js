const projectsController = {};

const Project = require('../models/Project');

projectsController.getProjects = async (req, res) => {
	const projects = await Project.find(); 
	res.json(projects)
}

projectsController.getProject = async (req, res) => {
	const project = await Project.findById(req.params.id)
	res.json(project)
}

projectsController.createProject = async (req, res) => {
	const { name, description, startDate, endDate,
			members, projectType, authorUserId} = req.body 
	
	const newProject = new Project({
		name,
		description,
		startDate,
		endDate,
		members,
		projectType,
		authorUserId
	})

	await newProject.save();

	res.json({message: 'Project Saved'});
}

projectsController.updateProject = async (req, res) => {
	const { name, description, startDate, endDate, status,
			members, projectType, authorUserId} = req.body 

	await Project.findByIdAndUpdate(req.params.id, {
		name,
		description,
		startDate,
		endDate,
		status,
		members,
		projectType,
		authorUserId
	})

	res.json({message: 'Project updated'})
}

projectsController.deleteProject = async (req, res) => {
	await Project.findByIdAndDelete(req.params.id)
	res.json({message: 'Project deleted'})
}

module.exports = projectsController;
