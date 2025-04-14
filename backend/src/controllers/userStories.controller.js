const userStoryControllers = {};

const UserStory = require('../models/UserStory');

userStoryControllers.getUserStories = async (req, res) => {
	const userStories = await UserStory.find(); 
	res.json(userStories)
}

userStoryControllers.getUserStory = async (req, res) => {
	const userStory = await UserStory.findById(req.params.id)
	res.json(userStory)
}

userStoryControllers.createUserStory = async (req, res) => {
	const { epicId, name, description, moscowPriorityId, startDate, 
			endDate, dueDate, members, authorUserId} = req.body 
	
	const newUserStory = new UserStory({
		epicId,
		name,
		description,
		moscowPriorityId,
		startDate,
		endDate,
		dueDate,
		members,
		authorUserId
	})

	await newUserStory.save();

	res.json({message: 'User Story Saved'});
}

userStoryControllers.updateUserStory = async (req, res) => {
	const { name, description, moscowPriorityId, startDate, 
			endDate, dueDate, members} = req.body 

	await UserStory.findByIdAndUpdate(req.params.id, {
		name,
		description,
		moscowPriorityId,
		startDate,
		endDate,
		dueDate,
		members,
	})

	res.json({message: 'User Story updated'})
}

userStoryControllers.deleteUserStory = async (req, res) => {
	await UserStory.findByIdAndDelete(req.params.id)
	res.json({message: 'User Story deleted'})
}

module.exports = userStoryControllers;
