const userStoriesController = {};

const User = require('../models/User');
const Epic = require('../models/Epic');
const UserStory = require('../models/UserStory');
const BaseController = require('./base.controller');
const { getUserIdFromToken } = require('../lib/token');

userStoriesController.getUserStories = async (req, res) => {
	try {
		const userStories = await UserStory.find({ deletedAt: null }); 

		if (!userStories) {
			return res.status(404).json({ error: 'UserStories not found' });
		}

		res.json(userStories);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

userStoriesController.getUserStory = async (req, res) => {
	try {
		const userStory = await UserStory.findOne({ _id: req.params.id, deletedAt: null });

		if (!userStory) {
			return res.status(404).json({ error: 'UserStory not found' });
		}

		res.json(userStory);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

userStoriesController.getUserStoryByEpic = async (req, res) => {
	try {
		const userStory = await UserStory.find({ epicId: req.params.id, deletedAt: null });

		if (!userStory) {
			return res.json({ userStories: [] });
		}

		res.json(userStory);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

userStoriesController.createUserStory = async (req, res) => {
	try {
		// Limpiar campos null o undefined para que usen sus valores por default en el modelo
		const createData = BaseController.cleanAndAssignDefaults(req.body);
		const userId = getUserIdFromToken(req);

		const user = await User.findById(userId);
		if (!user) {
		  return res.status(404).json({ error: 'User not found for this access token' });
		}

		createData.authorUserId = userId;

		const newUserStory = new UserStory(createData);
		await newUserStory.save();

		// Agregar el id del nuevo userStory al campo userStories del Epic 
		const epic = await Epic.findById(createData.epicId);
		epic.userStories.push(newUserStory._id);
		await epic.save();
		
		res.status(201).json({message: 'UserStory Saved', data: newUserStory});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

userStoriesController.updateUserStory = async (req, res) => {
	try {
		// Limpiar y asignar defaults donde sea necesario
		const updateData = BaseController.cleanAndAssignDefaults(req.body);
	
		const userStoryUpdated = await UserStory.findByIdAndUpdate(req.params.id, updateData, { new: true });
	
		if (!userStoryUpdated) {
			return res.status(404).json({ error: 'UserStory not found' });
		}
	
		const userStoryObject = userStoryUpdated.toObject();
	
		res.status(200).json({ message: 'UserStory Updated', user: userStoryObject });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
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
			return res.status(404).json({ error: 'UserStory not found' });
		}
	
		res.json({ message: 'UserStory Disabled', userStory });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Server Error: ' + error.message });
	}
}

module.exports = userStoriesController;
