const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const { validateCreateUserStory, validateUpdateUserStory } = require('../middlewares/validateUserStory');
const UserStory = require('../models/UserStory');
const Epic = require('../models/Epic');
const router = Router();

const { getUserStories, getUserStory, createUserStory, createUserStoriesBulk, 
		updateUserStory, deleteUserStory, getUserStoryByEpic, getUnassignedUserStoriesByProject } = require('../controllers/userStories.controller');

router.route('/')
	.get(getUserStories)
	.post(validateCreateUserStory, createUserStory);

router.route('/:id')
	.all(validateObjectId(UserStory))
	.get(getUserStory)
	.put(validateUpdateUserStory, updateUserStory)
	.delete(deleteUserStory);

router.route('/epic/:id')
	.all(validateObjectId(Epic))
	.get(getUserStoryByEpic);

router.post('/create/bulk', createUserStoriesBulk);

router.get('/project/:projectId/unassigned', getUnassignedUserStoriesByProject); 

module.exports = router;
