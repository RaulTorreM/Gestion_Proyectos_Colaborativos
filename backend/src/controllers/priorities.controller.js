const prioritiesController = {};

const Priority = require('../models/Priority');

prioritiesController.getPriorities = async (req, res) => {
	const priorities = await Priority.find(); 
	res.json(priorities)
}

prioritiesController.getPriority = async (req, res) => {
	const priority = await Priority.findOne({ PriorityId: req.params.PriorityId });
	res.json(priority)
}

prioritiesController.createPriority = async (req, res) => {
	const { name, description } = req.body 
	
	const newPriority = new Priority ({
		name,
		description,
	})

	await newPriority.save();

	res.json({message: 'Priority Saved'});
}

prioritiesController.updatePriority = async (req, res) => {
	const { description } = req.body 

	await Priority.findOneAndUpdate({ PriorityId: req.params.PriorityId }, {
		description,
	})

	res.json({message: 'Priority updated'})
}

prioritiesController.deletePriority = async (req, res) => {
	await Priority.findOneAndDelete({ PriorityId: req.params.PriorityId })
	res.json({message: 'Priority deleted'})
}

module.exports = prioritiesController;
