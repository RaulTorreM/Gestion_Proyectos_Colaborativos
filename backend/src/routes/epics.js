const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const { validateCreateEpic, validateUpdateEpic } = require('../middlewares/validateEpic');
const Epic = require('../models/Epic');
const Project = require('../models/Project');

const router = Router();

const { getEpics, getEpic, createEpic, updateEpic, deleteEpic, getEpicsByProjects } = require('../controllers/epics.controller');

router.route('/')
	.get(getEpics)
	.post(validateCreateEpic, createEpic);

router.route('/:id')
	.all(validateObjectId(Epic))
	.get(getEpic)
	.put(validateUpdateEpic, updateEpic)
	.delete(deleteEpic);

router.route('/project/:id')
	.get(getEpicsByProjects)

module.exports = router;