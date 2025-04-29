const userStoriesController = {};

const Epic = require('../models/Epic');
const UserStory = require('../models/UserStory');
const BaseController = require('./base.controller');

userStoriesController.getUserStories = async (req, res) => {
	try {
		const userStories = await UserStory.find({ deletedAt: null }); 

		if (!userStories) {
			return res.status(404).json({ message: 'UserStories not found' });
		}

		res.json(userStories);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

userStoriesController.getUserStory = async (req, res) => {
	try {
		const userStory = await UserStory.findOne({ _id: req.params.id, deletedAt: null });

		if (!userStory) {
			return res.status(404).json({ message: 'UserStory not found' });
		}

		res.json(userStory);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

userStoriesController.createUserStory = async (req, res) => {
	try {
		// Limpiar campos null o undefined para que usen sus valores por default en el modelo
		const createData = BaseController.cleanAndAssignDefaults(req.body);
		const newUserStory = new UserStory(createData);
		await newUserStory.save();

		// Agregar el id del nuevo userStory al campo userStories del Epic 
		const epic = await Epic.findById(createData.epicId);
		epic.userStories.push(newUserStory._id);
		await epic.save();
		
		res.status(201).json({message: 'UserStory Saved', userStory: newUserStory});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

userStoriesController.updateUserStory = async (req, res) => {
	try {
		// Limpiar y asignar defaults donde sea necesario
		const updateData = BaseController.cleanAndAssignDefaults(req.body);
	
		const userStoryUpdated = await UserStory.findByIdAndUpdate(req.params.id, updateData, { new: true });
	
		if (!userStoryUpdated) {
			return res.status(404).json({ message: 'UserStory not found' });
		}
	
		const userStoryObject = userStoryUpdated.toObject();
	
		res.status(200).json({ message: 'UserStory Updated', user: userStoryObject });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

userStoriesController.deleteUserStory = async (req, res) => {
	try {
		const userStory = await UserStory.findByIdAndUpdate(
			req.params.id,
			{ deletedAt: new Date() },
			{ new: true }
		);
	
		if (!userStory) {
			return res.status(404).json({ message: 'UserStory not found' });
		}
	
		res.json({ message: 'UserStory Disabled', userStory });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error', error: error.message });
	}
}

module.exports = userStoriesController;
