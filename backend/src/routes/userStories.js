const { Router } = require('express');
const router = Router();

const { getUserStories, getUserStory, createUserStory,
		updateUserStory, deleteUserStory } = require('../controllers/userStories.controller');

router.route('/')
	.get(getUserStories)
	.post(createUserStory);

router.route('/:id')
	.get(getUserStory)
	.put(updateUserStory)
	.delete(deleteUserStory);

module.exports = router;