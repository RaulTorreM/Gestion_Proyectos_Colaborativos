const { Router } = require('express');
const router = Router();

const { getProjects, getProject, createProject,
		updateProject, deleteProject } = require('../controllers/projects.controller');

router.route('/')
	.get(getProjects)
	.post(createProject);

router.route('/:id')
	.get(getProject)
	.put(updateProject)
	.delete(deleteProject);

module.exports = router;

