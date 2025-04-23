const { Router } = require('express');
const router = Router();

const { getPriorities, getPriority, createPriority,
		updatePriority, deletePriority } = require('../controllers/priorities.controller');

router.route('/')
	.get(getPriorities)
	.post(createPriority);

router.route('/:moscowPriorityId')
	.get(getPriority)
	.put(updatePriority)
	.delete(deletePriority);

module.exports = router;