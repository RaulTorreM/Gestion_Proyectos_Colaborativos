const notificationControllers = {};

const Notification = require('../models/Notification');

notificationControllers.getNotifications = async (req, res) => {
	const notifications = await Notification.find(); 
	res.json(notifications)
}

notificationControllers.getNotification = async (req, res) => {
	const notification = await Notification.findById(req.params.id)
	res.json(notification)
}

notificationControllers.createNotification = async (req, res) => {
	const { type, message, userId} = req.body 
	
	const newNotification = new Notification({
		type,
		message,
		userId,
	})

	await newNotification.save();

	res.json({message: 'Notification Saved'});
}

notificationControllers.updateNotification = async (req, res) => {
	const { read } = req.body 

	await Notification.findByIdAndUpdate(req.params.id, {
		read,
	})

	res.json({message: 'Notification updated'})
}

notificationControllers.deleteNotification = async (req, res) => {
	await Notification.findByIdAndDelete(req.params.id)
	res.json({message: 'Notification deleted'})
}

module.exports = notificationControllers;
