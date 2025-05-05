const { header, body } = require('express-validator');
const mongoose = require('mongoose');
const validateResult = require('./validateResult');
const Project = require('../models/Project');
const Priority = require('../models/Priority');
const UserStory = require('../models/UserStory');

const validateCreateEpic = [
  header('Authorization')
    .exists().withMessage('Authorization header is required')
    .notEmpty().withMessage('Authorization header cannot be empty')
    .matches(/^\S.+/).withMessage('Invalid Authorization header format'),

  body('projectId')
    .notEmpty().withMessage('ProjectId is required')
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid projectId');
      }

      const project = await Project.findOne({ _id: value, deletedAt: null });
      if (!project) {
        throw new Error('Project not found for this projectId');
      }
      return true;
    }),

  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .custom(async (value,  { req }) => {
      const { projectId } = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid projectId.');
      }

      const project = await Project.findById(projectId);
     
      if (!project) {
        throw new Error('Project not found for this name');
      }

      const duplicate = project.epics.find(epic => epic.name === value);

      if (duplicate) {
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
    .toDate()
    .custom(async (value, { req }) => {
      const { projectId, dueDate } = req.body;
  
      // Validar que el projectId sea válido y obtener el proyecto
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid projectId.');
      }
  
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found for this startDate.');
      }
  
      // Validar que el proyecto tenga startDate
      if (!project.startDate) {
        throw new Error('Project does not have a startDate.');
      }
  
      // Si no se envió startDate, no continuar validando fechas
      if (!value) return true;
  
      const startDate = new Date(value);
      const projectStartDate = new Date(project.startDate);
  
      // Validar que startDate sea posterior o igual al startDate del proyecto
      if (startDate < projectStartDate) {
        throw new Error("StartDate must be after or equal to the project's startDate.");
      }
  
      // Si se envió dueDate, validar diferencia mínima de 1 día
      if (dueDate) {
        const dueDateParsed = new Date(dueDate);
        const diffTime = dueDateParsed.getTime() - startDate.getTime();
        const oneDayInMs = 24 * 60 * 60 * 1000;
  
        if (diffTime < oneDayInMs) {
          throw new Error('StartDate must be at least 1 day before dueDate.');
        }
      }
  
      return true;
    }),
  
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid dueDate format')
    .toDate()
    .custom(async (value, { req }) => {
      const { projectId, startDate } = req.body;
  
      // Validar que el projectId sea válido y obtener el proyecto
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid projectId.');
      }
  
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found for this dueDate.');
      }
  
      if (value) {
        const dueDate = new Date(value);
        const projectDueDate = new Date(project.dueDate);
  
        // Validar que dueDate sea anterior o igual al dueDate del proyecto
        if (dueDate > projectDueDate) {
          throw new Error("DueDate must be before or equal to the project's dueDate.");
        }
  
        // Si se envió startDate, validar diferencia mínima de 1 día
        if (startDate) {
          const startDateParsed = new Date(startDate);
          const diffTime = dueDate.getTime() - startDateParsed.getTime();
          const oneDayInMs = 24 * 60 * 60 * 1000;
  
          if (diffTime < oneDayInMs) {
            throw new Error('DueDate must be at least 1 day after startDate.');
          }
        }
      }
  
      return true;
    }),

  body('priorityId')
    .notEmpty().withMessage('PriorityId is required')
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid priorityId');
      }

      const priority = await Priority.findOne({ _id: value, deletedAt: null });
      if (!priority) {
        throw new Error('Priority not found for this priorityId');
      }
      return true;
    }),

  validateResult
];

const validateUpdateEpic = [
  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .custom(async (value, { req }) => {
      const epicId = req.params.id;
      
      // Validar el formato de epicId
      if (!mongoose.Types.ObjectId.isValid(epicId)) {
        throw new Error('Invalid epicId.');
      }

      // Buscar el proyecto que contiene el epicId
      const project = await Project.findOne({ 'epics': epicId });

      if (!project) {
        throw new Error('Project not found for this epicId');
      }

      // Verificar si el nombre del epic ya existe en ese proyecto
      const duplicate = project.epics.some(epic => epic.name === value);

      if (duplicate) {
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
    .toDate()
    .custom(async (value, { req }) => {
      const epicId = req.params.id;
      
      // Validar el formato de epicId
      if (!mongoose.Types.ObjectId.isValid(epicId)) {
        throw new Error('Invalid epicId.');
      }

      // Buscar el proyecto que contiene el epicId
      const project = await Project.findOne({ 'epics': epicId });

      if (!project) {
        throw new Error('Project not found for this startDate');
      }
 
      if (!project.startDate) {
        throw new Error('Project does not have a startDate.');
      }

      const { dueDate } = req.body;
  
      // Si no se envió startDate, no continuar validando fechas
      if (!value) return true;
  
      const startDate = new Date(value);
      const projectStartDate = new Date(project.startDate);
  
      // Validar que startDate sea posterior o igual al startDate del proyecto
      if (startDate < projectStartDate) {
        throw new Error("StartDate must be after or equal to the project's startDate.");
      }
  
      // Si se envió dueDate, validar diferencia mínima de 1 día
      if (dueDate) {
        const dueDateParsed = new Date(dueDate);
        const diffTime = dueDateParsed.getTime() - startDate.getTime();
        const oneDayInMs = 24 * 60 * 60 * 1000;
  
        if (diffTime < oneDayInMs) {
          throw new Error('StartDate must be at least 1 day before dueDate.');
        }
      }
  
      return true;
    }),
  
  body('endDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid endDate format')
    .toDate(),

  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid dueDate format')
    .toDate()
    .custom(async (value, { req }) => {
      const epicId = req.params.id;
      
      // Validar el formato de epicId
      if (!mongoose.Types.ObjectId.isValid(epicId)) {
        throw new Error('Invalid epicId.');
      }

      // Buscar el proyecto que contiene el epicId
      const project = await Project.findOne({ 'epics': epicId });

      if (!project) {
        throw new Error('Project not found for this dueDate');
      }
  
      if (!project.dueDate) {
        throw new Error('Project does not have a dueDate.');
      }

      const { startDate } = req.body;
  
      if (value) {
        const dueDate = new Date(value);
        const projectDueDate = new Date(project.dueDate);
  
        // Validar que dueDate sea anterior o igual al dueDate del proyecto
        if (dueDate > projectDueDate) {
          throw new Error("DueDate must be before or equal to the project's dueDate.");
        }
  
        // Si se envió startDate, validar diferencia mínima de 1 día
        if (startDate) {
          const startDateParsed = new Date(startDate);
          const diffTime = dueDate.getTime() - startDateParsed.getTime();
          const oneDayInMs = 24 * 60 * 60 * 1000;
  
          if (diffTime < oneDayInMs) {
            throw new Error('DueDate must be at least 1 day after startDate.');
          }
        }
      }
  
      return true;
    }),
  
  body('priorityId')
    .optional({ nullable: true })
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid priorityId');
      }

      const priority = await Priority.findOne({ _id: value, deletedAt: null });
      if (!priority) {
        throw new Error('Priority not found for this priorityId');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['Pendiente', 'En Progreso', 'Completado']).withMessage('Invalid status value'),

  body('userStories')
    .optional({ nullable: true })
    .isArray().withMessage('UserStories must be an array')
    .custom(async (value) => {
      if (value) {
        const userStoryValidationPromises = value.map(async (userStoryId) => {
          // Verificar que el id de userStory sea válido
          if (!mongoose.Types.ObjectId.isValid(userStoryId)) {
            throw new Error('Each userStory must have a valid id');
          }
  
          // Buscar el UserStory por el ObjectId
          const userStory = await UserStory.findById(userStoryId);
          if (!userStory) {
            throw new Error(`UserStory with ID ${userStoryId} does not exist`);
          }
        });
  
        // Esperar que todas las validaciones se resuelvan
        await Promise.all(userStoryValidationPromises);
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
  validateCreateEpic,
  validateUpdateEpic
};
