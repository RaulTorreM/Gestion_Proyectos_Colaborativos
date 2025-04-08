const { Router } = require('express');
const router = Router();

const { getEpics, getEpic, createEpic, updateEpic, deleteEpic } = require('../controllers/epics.controller');

router.route('/')
	.get(getEpics)
	.post(createEpic);

router.route('/:id')
	.get(getEpic)
	.put(updateEpic)
	.delete(deleteEpic);

module.exports = router;