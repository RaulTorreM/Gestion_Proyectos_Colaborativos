const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const { validateCreateUserStory, validateUpdateUserStory } = require('../middlewares/validateUserStory');
const UserStory = require('../models/UserStory');
const router = Router();

const { getUserStories, getUserStory, createUserStory,
		updateUserStory, deleteUserStory } = require('../controllers/userStories.controller');

router.route('/')
	.get(getUserStories)
	.post(validateCreateUserStory, createUserStory);

router.route('/:id')
	.all(validateObjectId(UserStory))
	.get(getUserStory)
	.put(validateUpdateUserStory, updateUserStory)
	.delete(deleteUserStory);

module.exports = router;