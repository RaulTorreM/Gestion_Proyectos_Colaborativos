const { header, body } = require('express-validator');
const validateResult = require('./validateResult');

const validateLoginUser = [
  body('email')
    .isEmail().withMessage('A valid email is required'),

  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  validateResult
];

const validateGetLoggedUser = [
  header('Authorization')
    .exists().withMessage('Authorization header is required')
    .notEmpty().withMessage('Authorization header cannot be empty')
    .matches(/^\S.+/).withMessage('Invalid Authorization header format'),

  validateResult
];

module.exports = {
  validateLoginUser,
  validateGetLoggedUser
};
