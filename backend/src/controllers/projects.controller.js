const projectControllers = {};

const Project = require('../models/Project');

projectControllers.getProjects = async (req, res) => {
	const projects = await Project.find(); 
	res.json(projects)
}

projectControllers.getProject = async (req, res) => {
	const project = await Project.findById(req.params.id)
	res.json(project)
}

projectControllers.createProject = async (req, res) => {
	const { title, description, startDate, endDate, status, teamMembers, projectType, authorUserId} = req.body 
	
	const newProject = new Project({
		title,
		description,
		startDate,
		endDate,
		status,
		teamMembers,
		projectType,
		authorUserId
	})

	await newProject.save();

	res.json({message: 'Project Saved'});
}

projectControllers.updateProject = async (req, res) => {
	const { title } = req.body 

	await Project.findByIdAndUpdate(req.params.id, {
		title,
	})

	res.json({message: 'Project updated'})
}

projectControllers.deleteProject = async (req, res) => {
	await Project.findByIdAndDelete(req.params.id)
	res.json({message: 'Project deleted'})
}

module.exports = projectControllers;
