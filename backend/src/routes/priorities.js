const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const validateObjectIdArray = require('../middlewares/validateObjectIdArray');
const { validateCreatePriority, validateUpdatePriority } = require('../middlewares/validatePriority');
const Priority = require('../models/Priority');
const router = Router();

const { getPriorities, getPriority, getPriorityByMoscowPriority, getPrioritiesBulk, 
		createPriority, updatePriority, deletePriority } = require('../controllers/priorities.controller');

const validateNotToBeMoscowPriority = () => {
	return async (req, res, next) => {
		const { id } = req.params;
	
		try {
			const priority = await Priority.findById(id);
			
			if (priority.moscowPriority !== null) {
				return res.status(404).json({ error: 'Cannot update or delete a moscow priority.' });
			}
		} catch (err) {
			return res.status(500).json({ error: 'Server error during validation.' });
		}

		next();
	};
};

const validateMoscowPriority = () => {
	return async (req, res, next) => {
		const moscowPriority = Number(req.params.moscowPriority);
	
		try {
			if (![1, 2, 3, 4].includes(moscowPriority)) {
				return res.status(400).json({ error: 'Invalid moscowPriority.' });
			}
		} catch (err) {
			return res.status(500).json({ error: 'Server error during validation.' });
		}
	
		next();
	};
};

router.route('/')
	.get(getPriorities)
	.post(validateCreatePriority, createPriority);

router.route('/:id')
	.all(validateObjectId(Priority))
	.get(getPriority)
	.put(validateNotToBeMoscowPriority(), validateUpdatePriority, updatePriority)
	.delete(validateNotToBeMoscowPriority(), deletePriority);

router.route('/moscowPriority/:moscowPriority')
	.get(validateMoscowPriority(), getPriorityByMoscowPriority);

router.post('/bulk/ids', validateObjectIdArray(Priority), getPrioritiesBulk);

module.exports = router;