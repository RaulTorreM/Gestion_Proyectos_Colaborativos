const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const { validateCreateProject, validateUpdateProject, validateDeleteProject} = require('../middlewares/validateProject');
const Project = require('../models/Project');
const router = Router();

const { getProjects, getProject, getProjectByEpic, getProjectsByUser, createProject,
		updateProject, disableProject, deleteProject } = require('../controllers/projects.controller');

router.route('/')
	.get(getProjects)
	.post(validateCreateProject, createProject);

router.route('/:id')
	.all(validateObjectId(Project))
	.get(getProject)
	.put(validateUpdateProject, updateProject);

router.get('/epic/:id', getProjectByEpic);

router.get('/user/:id', getProjectsByUser);

router.route('/disable/:id')
	.delete(validateObjectId(Project), disableProject)

router.route('/delete/:id')
	.delete(validateObjectId(Project), validateDeleteProject, deleteProject)

module.exports = router;

