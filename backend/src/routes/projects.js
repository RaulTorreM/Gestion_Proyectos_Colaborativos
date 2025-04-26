const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const { validateCreateProject, validateUpdateProject } = require('../middlewares/validateProject');
const Project = require('../models/Project');
const router = Router();

const { getProjects, getProject, createProject,
		updateProject, deleteProject } = require('../controllers/projects.controller');

router.route('/')
	.get(getProjects)
	.post(validateCreateProject, createProject);

router.route('/:id')
	.all(validateObjectId(Project))
	.get(getProject)
	.put(validateUpdateProject, updateProject)
	.delete(deleteProject);

module.exports = router;

