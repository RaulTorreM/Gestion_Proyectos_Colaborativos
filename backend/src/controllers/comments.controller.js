const commentsController = {};

const User = require('../models/User');
const Comment = require('../models/Comment');
const BaseController = require('./base.controller');
const { getUserIdFromToken } = require('../lib/token');

commentsController.getComments = async (req, res) => {
	// Consulta a la BD
	const comments = await Comment.find(); 
	res.json(comments);
}

commentsController.getComment = async (req, res) => {
	const comment = await Comment.findById(req.params.id);
	res.json(comment);
}

commentsController.createComment = async (req, res) => {
	// Limpiar campos null o undefined para que usen sus valores por default en el modelo
	const createData = BaseController.cleanAndAssignDefaults(req.body);
	const userId = getUserIdFromToken(req);

	const user = await User.findById(userId);
	if (!user) {
	  return res.status(404).json({ error: 'User not found for this access token' });
	}

	createData.authorUserId = userId;

	const newComment = new Comment(createData);
	await newComment.save();

	res.json({message: 'Comment Saved', data: newComment});
}

commentsController.updateComment = async (req, res) => {
	// Limpiar y asignar defaults donde sea necesario
	const updateData = BaseController.cleanAndAssignDefaults(req.body);
	const commentUpdated = await Comment.findByIdAndUpdate(req.params.id, updateData, { new: true });

	res.json({message: 'Comment updated', data: commentUpdated})
}

commentsController.deleteComment = async (req, res) => {
	await Comment.findByIdAndDelete(req.params.id)
	res.json({message: 'Comment deleted'})
}

module.exports = commentsController;
