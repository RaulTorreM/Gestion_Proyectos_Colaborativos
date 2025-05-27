const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const { validateCreateEpic, validateUpdateEpic } = require('../middlewares/validateEpic');
const Epic = require('../models/Epic');
const validateObjectIdArray = require('../middlewares/validateObjectIdArray');
const router = Router();

const { getEpics, getEpic, createEpic, updateEpic, deleteEpic, getEpicsByProjects, getEpicsBulk, getEpicUserStories, getEpicsStatsByProject } = require('../controllers/epics.controller');

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

router.post('/bulk/ids', validateObjectIdArray(Epic), getEpicsBulk);

router.route('/:id/user-stories')
  .get(getEpicUserStories);

router.route('/project/:id/stats')
  .get(getEpicsStatsByProject);

module.exports = router;