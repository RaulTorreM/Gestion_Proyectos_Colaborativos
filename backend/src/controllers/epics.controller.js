const epicControllers = {};

const Epic = require('../models/Epic');

epicControllers.getEpics = async (req, res) => {
	// Consulta a la BD
	const epics = await Epic.find(); 
	res.json(epics)
}

epicControllers.getEpic = async (req, res) => {
	const epic = await Epic.findById(req.params.id)
	res.json(epic)
}

epicControllers.createEpic = async (req, res) => {
	const { project, title, description, startDate, endDate, authorUserId } = req.body 
	
	const newEpic = new Epic({
		project,
		title,
		description,
		startDate,
		endDate,
		authorUserId
	})

	await newEpic.save();

	res.json({message: 'Epic Saved'});
}

epicControllers.updateEpic = async (req, res) => {
	const { project, title, description, status, startDate, endDate, authorUserId } = req.body 

	await Epic.findByIdAndUpdate(req.params.id, {
		project,
		title,
		description,
		status,
		startDate,
		endDate,
		authorUserId
	})

	res.json({message: 'Epic updated'})
}

epicControllers.deleteEpic = async (req, res) => {
	await Epic.findByIdAndDelete(req.params.id)
	res.json({message: 'Epic deleted'})
}

module.exports = epicControllers;
