const moscowPriorityControllers = {};

const MoscowPriority = require('../models/MoscowPriority');

moscowPriorityControllers.getMoscowPriorities = async (req, res) => {
	const moscowPriorities = await MoscowPriority.find(); 
	res.json(moscowPriorities)
}

moscowPriorityControllers.getMoscowPriority = async (req, res) => {
	const moscowPriority = await MoscowPriority.findOne({ moscowPriorityId: req.params.moscowPriorityId });
	res.json(moscowPriority)
}

moscowPriorityControllers.createMoscowPriority = async (req, res) => {
	const { name, description } = req.body 
	
	const newMoscowPriority = new MoscowPriority ({
		name,
		description,
	})

	await newMoscowPriority.save();

	res.json({message: 'Moscow Priority Saved'});
}

moscowPriorityControllers.updateMoscowPriority = async (req, res) => {
	const { description } = req.body 

	await MoscowPriority.findOneAndUpdate({ moscowPriorityId: req.params.id }, {
		description,
	})

	res.json({message: 'Moscow Priority updated'})
}

moscowPriorityControllers.deleteMoscowPriority = async (req, res) => {
	await MoscowPriority.findOneAndDelete({ moscowPriorityId: req.params.id })
	res.json({message: 'Moscow Priority deleted'})
}

module.exports = moscowPriorityControllers;
