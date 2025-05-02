const { body } = require('express-validator');
const validateResult = require('./validateResult');

const validateLoginUser = [
  body('email')
    .isEmail().withMessage('A valid email is required'),

  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  validateResult
];

module.exports = {
  validateLoginUser
};
