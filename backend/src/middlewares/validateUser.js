const { body } = require('express-validator');
const validateResult = require('./validateResult');
const moment = require('moment-timezone');
const User = require('../models/User');

const validateCreateUser = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .custom(async (value) => {
      const user = await User.findOne({ name: value });
      if (user) {
        throw new Error('Username is already taken');
      }
      return true;
    }),

  body('email')
    .isEmail().withMessage('Valid email is required')
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('Email is already registered');
      }
      return true;
    }),

  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('avatar')
    .optional({ nullable: true })
    .custom((value, { req }) => {
      if (typeof value !== 'string' || !value.match(/\.(jpg|jpeg|png)$/i)) {
        throw new Error('Avatar must be a valid image name with jpg, jpeg or png extension');
      }
      return true;
    }),

  validateResult
];

const validateUpdateUser = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .custom(async (value, { req }) => {
      const userId = req.params.id;  
      const user = await User.findOne({ name: value });
      if (user && user._id.toString() !== userId.toString()) {  // Ignora el propio usuario
        throw new Error('Username is already taken');
      }
      return true;
    }),

  body('avatar')
    .optional({ nullable: true })
    .custom((value) => {
      if (typeof value !== 'string' || !value.match(/\.(jpg|jpeg|png)$/i)) {
        throw new Error('Avatar must be a valid image name with jpg, jpeg or png extension');
      }
      return true;
    }),  
    
  body('projects').optional().isArray().withMessage('Projects must be an array'),

  body('settings.notifications.email')
    .optional()
    .isBoolean().withMessage('settings.notifications.email must be boolean'),

  body('settings.notifications.push')
    .optional()
    .isBoolean().withMessage('settings.notifications.push must be boolean'),

  body('settings.theme')
    .optional()
    .isString().withMessage('theme must be a string')
    .isIn(['light', 'dark']).withMessage('theme must be either "light" or "dark"'),

  body('preferences.language')
    .optional()
    .isString().withMessage('language must be a string')
    .isIn(['es', 'en']).withMessage('language must be either "es" or "en"'),
  
  body('preferences.timezone')
    .optional()
    .isString().withMessage('timezone must be a string')
    .custom((value) => {
      if (value && !moment.tz.names().includes(value)) {
        throw new Error('Invalid timezone. Please provide a valid timezone like "America/Lima" or "Europe/Madrid".');
      }
      return true;
    }),

  body('deletedAt')
    .optional()
    .isISO8601().withMessage('Invalid date format')
    .toDate(),

  validateResult
];

module.exports = {
  validateCreateUser,
  validateUpdateUser
};
