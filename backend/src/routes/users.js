const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const { validateCreateUser, validateUpdateUser } = require('../middlewares/validateUser');
const User = require('../models/User');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/users.controller');

const router = Router();

router.route('/')
  .get(getUsers)
  .post(validateCreateUser, createUser)

router.route('/:id')
  .all(validateObjectId(User))
  .get(getUser)
  .put(validateUpdateUser, updateUser)
  .delete(deleteUser);

module.exports = router;
