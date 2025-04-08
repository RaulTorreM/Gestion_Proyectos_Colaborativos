const { Router } = require('express');
const router = Router();

const { getMoscowPriorities, getMoscowPriority, createMoscowPriority,
		updateMoscowPriority, deleteMoscowPriority } = require('../controllers/moscowPriorities.controller');

router.route('/')
	.get(getMoscowPriorities)
	.post(createMoscowPriority);

router.route('/:moscowPriorityId')
	.get(getMoscowPriority)
	.put(updateMoscowPriority)
	.delete(deleteMoscowPriority);

module.exports = router;