const { param, header, body } = require('express-validator');
const mongoose = require('mongoose');
const validateResult = require('./validateResult');
const User = require('../models/User');
const Project = require('../models/Project');
const Version = require('../models/Version');
const Epic = require('../models/Epic');

const validateCreateProject = [
  header('Authorization')
    .exists().withMessage('Authorization header is required')
    .notEmpty().withMessage('Authorization header cannot be empty')
    .matches(/^\S.+/).withMessage('Invalid Authorization header format'),
    
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
      const startDate = req.body.startDate ? new Date(req.body.startDate) : new Date();
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
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid dueDate format')
    .toDate()
    .custom(async (value, { req }) => {
      const project = await Project.findById(req.params.id);

      if (!project) {
        throw new Error('Project not found for this dueDate');
      }
      
      const startDate = req.body.startDate ? new Date(req.body.startDate) : project.startDate;
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
  
  body('status')
    .optional()
    .notEmpty().withMessage('Status is required') 
    .isIn(['No Iniciado', 'En Progreso', 'Finalizado']).withMessage('Invalid status value'),

  body('members')
    .optional({ nullable: true })
    .isArray().withMessage('Members must be an array')
    .custom(async (value) => {
      const uniqueMembers = new Set();
  
      // Crear un array de Promesas para las consultas User.findById
      const userPromises = value.map(async (member) => {
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
      });
  
      // Ejecutar todas las promesas en paralelo
      await Promise.all(userPromises);
  
      return true;
    }),

  body('projectType')
    .optional()
    .isString().withMessage('Project type must be a string'),
 
  body('versions')
    .optional({ nullable: true })
    .isArray().withMessage('Versions must be an array')
    .custom(async (value) => {
      if (value) {
        const versionValidationPromises = value.map(async (versionId) => {
          if (!mongoose.Types.ObjectId.isValid(versionId)) {
            throw new Error('Each version must have a valid id');
          }
  
          const version = await Version.findById(versionId);
          if (!version) {
            throw new Error(`Version with ID ${versionId} does not exist`);
          }
        });
  
        // Esperar que todas las validaciones se resuelvan
        await Promise.all(versionValidationPromises);
      }
      return true;
    }),

  body('epics')
    .optional({ nullable: true })
    .isArray().withMessage('Epics must be an array')
    .custom(async (value) => {
      if (value) {
        const epicValidationPromises = value.map(async (epicId) => {
          // Verificar que el id de epic sea válido
          if (!mongoose.Types.ObjectId.isValid(epicId)) {
            throw new Error('Each epic must have a valid id');
          }
  
          // Buscar el Epic por el ObjectId
          const epic = await Epic.findById(epicId);
          if (!epic) {
            throw new Error(`Epic with ID ${epicId} does not exist`);
          }
        });
  
        // Esperar que todas las validaciones se resuelvan
        await Promise.all(epicValidationPromises);
      }
      return true;
    }),
  
  body('deletedAt')
    .optional()
    .isISO8601().withMessage('Invalid date format')
    .toDate(),

  validateResult
];

const validateDeleteProject = [
  param('id')
    .exists().withMessage('ProjectId is required')
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid ProjectId format');
      }

      const project = await Project.findById(value);
      if (!project) {
        throw new Error(`Project with ID ${value} does not exist`);
      }

      if (project.epics && (Array.isArray(project.epics) && project.epics.length !== 0)) {
        throw new Error(`Project with ID ${value} has epics`);
      }

      return true;
    }),

  validateResult
];


module.exports = {
  validateCreateProject,
  validateUpdateProject,
  validateDeleteProject
};
