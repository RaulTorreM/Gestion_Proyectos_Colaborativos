const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const Comment = require('../models/Comment');
const router = Router();

const { getComments, getComment, createComment, 
		updateComment, deleteComment } = require('../controllers/comments.controller');

router.route('/')
	.get(getComments)
	.post(createComment);

router.route('/:id')
	.all(validateObjectId(Comment))
	.get(getComment)
	.put(updateComment)
	.delete(deleteComment);

module.exports = router;