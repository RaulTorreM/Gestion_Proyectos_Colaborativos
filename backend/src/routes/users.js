const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const { validateCreateUser, validateUpdateUser } = require('../middlewares/validateUser');
const User = require('../models/User');
const validateObjectIdArray = require('../middlewares/validateObjectIdArray');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUsersBulk
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

router.post('/bulk/ids',
  validateObjectIdArray(User),
  getUsersBulk
);

module.exports = router;
