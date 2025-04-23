const commentsController = {};

const Comment = require('../models/Comment');

commentsController.getComments = async (req, res) => {
	// Consulta a la BD
	const comments = await Comment.find(); 
	res.json(comments)
}

commentsController.getComment = async (req, res) => {
	const comment = await Comment.findById(req.params.id)
	res.json(comment)
}

commentsController.createComment = async (req, res) => {
	const { userStoryId, authorUserId, text, mentions } = req.body 
	
	const newComment = new Comment({
		userStoryId,
		authorUserId,
		text,
		mentions,
	})

	await newComment.save();

	res.json({message: 'Comment Saved'});
}

commentsController.updateComment = async (req, res) => {
	const { text, mentions } = req.body 

	await Comment.findByIdAndUpdate(req.params.id, {
		text,
		mentions,
	})

	res.json({message: 'Comment updated'})
}

commentsController.deleteComment = async (req, res) => {
	await Comment.findByIdAndDelete(req.params.id)
	res.json({message: 'Comment deleted'})
}

module.exports = commentsController;
