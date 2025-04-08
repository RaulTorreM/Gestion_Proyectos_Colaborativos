const { Router } = require('express');
const router = Router();

const { getNotifications, getNotification, createNotification, 
		updateNotification, deleteNotification } = require('../controllers/notifications.controller');

router.route('/')
	.get(getNotifications)
	.post(createNotification);

router.route('/:id')
	.get(getNotification)
	.put(updateNotification)
	.delete(deleteNotification);

module.exports = router;