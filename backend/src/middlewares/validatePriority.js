const { body } = require('express-validator');
const validateResult = require('./validateResult');
const moment = require('moment-timezone');
const Priority = require('../models/Priority');

const validateCreatePriority = [
  body('moscowPriority')
    .optional()
    .not().exists().withMessage('Cannot create a new moscow priority'), 
    
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .custom(async (value) => {
      const priority = await Priority.findOne({ name: value});
      if (priority) {
        throw new Error('Name is already taken');
      }
      return true;
    }),

  body('description')
    .optional({ nullable: true })
    .isString().withMessage('Description must be a string'),
  
  body('color')
    .optional({ nullable: true })
    .customSanitizer(value => value.toUpperCase())
    .matches(/^#([A-F0-9]{6})$/)
    .withMessage('Color must be in hexadecimal format including #, e.g., #F29B26'),
  
  validateResult
];

const validateUpdatePriority = [
  body('moscowPriority')
    .optional()
    .not().exists().withMessage('Cannot update a new moscow priority'), 
    
    body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .custom(async (value, { req }) => {
      const priority = await Priority.findOne({ name: value, _id: { $ne: req.params.id } });

      console.log(priority);

      if (priority) {
        throw new Error('Name is already taken');
      }
      return true;
    }),

  body('description')
    .optional({ nullable: true })
    .isString().withMessage('Description must be a string'),
  
  body('color')
    .optional({ nullable: true })
    .customSanitizer(value => value.toUpperCase())
    .matches(/^#([A-F0-9]{6})$/)
    .withMessage('Color must be in hexadecimal format including #, e.g., #F29B26'),
  
  body('deletedAt')
    .optional()
    .isISO8601().withMessage('Invalid date format')
    .toDate(),
    
  validateResult
];

module.exports = {
  validateCreatePriority,
  validateUpdatePriority
};
