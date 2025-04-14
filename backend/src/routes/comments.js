const { Router } = require('express');
const router = Router();

const { getComments, getComment, createComment, 
		updateComment, deleteComment } = require('../controllers/comments.controller');

router.route('/')
	.get(getComments)
	.post(createComment);

router.route('/:id')
	.get(getComment)
	.put(updateComment)
	.delete(deleteComment);

module.exports = router;