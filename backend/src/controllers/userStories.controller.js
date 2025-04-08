const userStoryControllers = {};

const UserStory = require('../models/UserStory');

userStoryControllers.getUserStories = async (req, res) => {
	const userStories = await UserStory.find(); 
	res.json(userStories)
}

userStoryControllers.getUserStory = async (req, res) => {
	const userStory = await UserStory.findById(req.params.id)
	res.json(UserStory)
}

userStoryControllers.createUserStory = async (req, res) => {
	const { epic, title, description, priority, status,
			startDate, endDate, dueDate, assignedTo, createdBy} = req.body 
	
	const newUserStory = new UserStory({
		epic,
		title,
		description,
		priority,
		status,
		startDate,
		endDate,
		dueDate,
		assignedTo,
		createdBy
	})

	await newUserStory.save();

	res.json({message: 'User Story Saved'});
}

userStoryControllers.updateUserStory = async (req, res) => {
	const { title } = req.body 

	await UserStory.findByIdAndUpdate(req.params.id, {
		title,
	})

	res.json({message: 'User Story updated'})
}

userStoryControllers.deleteUserStory = async (req, res) => {
	await UserStory.findByIdAndDelete(req.params.id)
	res.json({message: 'User Story deleted'})
}

module.exports = userStoryControllers;
