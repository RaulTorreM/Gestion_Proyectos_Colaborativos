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
	const { title, description, startDate, endDate, status, teamMembers, EpicType, authorUserId} = req.body 
	const newEpic = new Epic({
		title,
		description,
		startDate,
		endDate,
		status,
		teamMembers,
		EpicType,
		authorUserId
	})

	await newEpic.save();

	res.json({message: 'Epic Saved'});
}

epicControllers.updateEpic = async (req, res) => {
	const { title } = req.body 

	await Epic.findByIdAndUpdate(req.params.id, {
		title,
	})

	res.json({message: 'Epic updated'})
}

epicControllers.deleteEpic = async (req, res) => {
	await Epic.findByIdAndDelete(req.params.id)
	res.json({message: 'Epic deleted'})
}

module.exports = epicControllers;
