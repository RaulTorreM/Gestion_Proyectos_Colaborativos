const { body } = require('express-validator');
const mongoose = require('mongoose');
const validateResult = require('./validateResult');
const Project = require('../models/Project');
const User = require('../models/User');

const validateCreateProject = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .custom(async (value) => {
      const project = await Project.findOne({ name: value });
      if (project) {
        throw new Error('Name is already taken');
      }
      return true;
    }),

  body('description')
    .notEmpty().withMessage('Description is required') 
    .isString().withMessage('Description must be a string'),

  body('startDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid startDate format')
    .toDate(),

  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Invalid dueDate format')
    .toDate()
    .custom((value, { req }) => {
      const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
      const dueDate = new Date(value);

      // Si startDate existe
      if (startDate) {
        // Diferencia en milisegundos
        const diffTime = dueDate.getTime() - startDate.getTime();
        const oneDayInMs = 24 * 60 * 60 * 1000;

        if (diffTime < oneDayInMs) {
          throw new Error('Due date must be at least 1 day after start date');
        }
      }

      // Si no hay startDate, no valida la diferencia
      return true;
    }),

  body('members')
    .optional({ nullable: true })
    .isArray().withMessage('Members must be an array')
    .custom(async (value) => {
      const uniqueMembers = new Set();

      for (const member of value) {
        if (!member.userId || !mongoose.Types.ObjectId.isValid(member.userId)) {
          throw new Error('Each member must have a valid userId');
        }

        const user = await User.findById(member.userId);
        if (!user) {
          throw new Error(`User with ID ${member.userId} does not exist`);
        }

        if (!member.role) {
          throw new Error('Each member must have a role');
        }

        if (!member.joinedAt || isNaN(new Date(member.joinedAt))) {
          throw new Error('Each member must have a valid joinedAt date');
        }

        // Evitar duplicados userId + role
        const key = `${member.userId}-${member.role}`;
        if (uniqueMembers.has(key)) {
          throw new Error(`User ${member.userId} is already assigned as ${member.role}`);
        }
        uniqueMembers.add(key);
      }

      return true;
  }),

  body('projectType')
    .notEmpty().withMessage('Project type is required')
    .isString().withMessage('Project type must be a string'),
  
  body('authorUserId')
    .notEmpty().withMessage('AuthorUserId is required')
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid AuthorUserId');
      }
      const user = await User.findById(value);
      if (!user) {
        throw new Error('Author User not found');
      }
      return true;
    }),

  validateResult
];

const validateUpdateProject = [
  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .custom(async (value, { req }) => {
      const project = await Project.findOne({ name: value, _id: { $ne: req.params.id } });
      if (project) {
        throw new Error('Name is already taken');
      }
      return true;
    }),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),
  
  body('startDate')
    .optional()
    .isISO8601().withMessage('Invalid startDate format')
    .toDate(),

  body('endDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid endDate format')
    .toDate(),
  
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Invalid dueDate format')
    .toDate(),
  
  body('status')
    .optional()
    .notEmpty().withMessage('Status is required') 
    .isIn(['No Iniciado', 'En Progreso', 'Finalizado']).withMessage('Invalid status value'),

  body('members')
    .optional({ nullable: true })
    .isArray().withMessage('Members must be an array')
    .custom(async (value) => {
      const uniqueMembers = new Set();

      for (const member of value) {
        if (!member.userId || !mongoose.Types.ObjectId.isValid(member.userId)) {
          throw new Error('Each member must have a valid userId');
        }

        const user = await User.findById(member.userId);
        if (!user) {
          throw new Error(`User with ID ${member.userId} does not exist`);
        }

        if (!member.role) {
          throw new Error('Each member must have a role');
        }

        if (!member.joinedAt || isNaN(new Date(member.joinedAt))) {
          throw new Error('Each member must have a valid joinedAt date');
        }

        // Evitar duplicados userId + role
        const key = `${member.userId}-${member.role}`;
        if (uniqueMembers.has(key)) {
          throw new Error(`User ${member.userId} is already assigned as ${member.role}`);
        }
        uniqueMembers.add(key);
      }

      return true;
  }),

  body('projectType')
    .optional()
    .isString().withMessage('Project type must be a string'),
 
  body('epics')
    .optional({ nullable: true })
    .isArray().withMessage('Epics must be an array') 
    .custom((value) => {
      value.forEach((epicId) => {
        if (!mongoose.Types.ObjectId.isValid(epicId)) {
          throw new Error('Each epic must have a valid ID');
        }
      });
      return true;
    }),
  
  body('deletedAt')
    .optional()
    .isISO8601().withMessage('Invalid date format')
    .toDate(),

  validateResult
];

module.exports = {
  validateCreateProject,
  validateUpdateProject
};
