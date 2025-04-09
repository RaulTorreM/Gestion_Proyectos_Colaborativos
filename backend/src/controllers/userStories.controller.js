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
	const { epic, title, description, moscowPriorityId, startDate, 
			endDate, dueDate, teamMembers, authorUserId} = req.body 
	
	const newUserStory = new UserStory({
		epic,
		title,
		description,
		moscowPriorityId,
		startDate,
		endDate,
		dueDate,
		teamMembers,
		authorUserId
	})

	await newUserStory.save();

	res.json({message: 'User Story Saved'});
}

userStoryControllers.updateUserStory = async (req, res) => {
	const { title, description, moscowPriorityId, startDate, 
			endDate, dueDate, teamMembers} = req.body 

	await UserStory.findByIdAndUpdate(req.params.id, {
		title,
		description,
		moscowPriorityId,
		startDate,
		endDate,
		dueDate,
		teamMembers,
	})

	res.json({message: 'User Story updated'})
}

userStoryControllers.deleteUserStory = async (req, res) => {
	await UserStory.findByIdAndDelete(req.params.id)
	res.json({message: 'User Story deleted'})
}

module.exports = userStoryControllers;
