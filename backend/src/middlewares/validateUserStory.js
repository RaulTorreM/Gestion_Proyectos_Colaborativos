const { body, header } = require('express-validator');
const mongoose = require('mongoose');
const validateResult = require('./validateResult');
const User = require('../models/User');
const Epic = require('../models/Epic');
const Version = require('../models/Version');
const Priority = require('../models/Priority');

const validateCreateUserStory = [
  header('Authorization')
    .exists().withMessage('Authorization header is required')
    .notEmpty().withMessage('Authorization header cannot be empty')
    .matches(/^\S.+/).withMessage('Invalid Authorization header format'),

  body('epicId')
    .notEmpty().withMessage('EpicId is required')
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid epicId');
      }

      const epic = await Epic.findOne({ _id: value, deletedAt: null });
      if (!epic) {
        throw new Error('Epic not found for this epicId');
      }
      return true;
    }),

  body('versionId')
    .optional({ nullable: true })
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid versionId');
      }

      const version = await Version.findOne({ _id: value, deletedAt: null });
      if (!version) {
        throw new Error('Version not found for this versionId');
      }
      return true;
    }),
    
  body('name')
    .notEmpty().withMessage('Name is required')
    .custom(async (value,  { req }) => {
      const { epicId } = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(epicId)) {
        throw new Error('Invalid epicId.');
      }

      const epic = await Epic.findById(epicId);
     
      if (!epic) {
        throw new Error('Epic not found for this epicId');
      }

      const duplicate = epic.userStories.find(userStory => userStory.name === value);

      if (duplicate) {
        throw new Error('Name is already taken');
      }

      return true;
    }),

  body('description')
    .notEmpty().withMessage('Description is required') 
    .isString().withMessage('Description must be a string'),

  body('moscowPriority')
    .optional({ nullable: true })
    .custom(async (value, { req }) => {
      const intValue = parseInt(value, 10);
      
      if (isNaN(intValue) || intValue < 1 || intValue > 4) {
        throw new Error('Invalid moscowPriority or must be an integer between 1 y 4.');
      }
      
      const priority = await Priority.findOne({ moscowPriority: intValue, deletedAt: null});

      if (!priority) {
        throw new Error(`Priority not found for moscowPriority ${intValue}`);
      }
      
      if (req.body.priorityId) {
        throw new Error(`Priority not found for moscowPriority ${intValue}`);
      }
      return true;
    }),

  body('startDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid startDate format')
    .toDate()
    .custom(async (value, { req }) => {
      const { epicId, dueDate } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(epicId)) {
        throw new Error('Invalid epicId.');
      }
  
      const epic = await Epic.findById(epicId);
      if (!epic) {
        throw new Error('Epic not found for this startDate.');
      }
  
      if (!epic.startDate) {
        throw new Error('Epic does not have a startDate.');
      }
  
      // Si no se envió startDate, no continuar validando fechas
      if (!value) return true;
  
      const startDate = new Date(value);
      const epicStartDate = new Date(epic.startDate);
  
      // Validar que startDate sea posterior o igual al startDate del proyecto
      if (startDate < epicStartDate) {
        throw new Error("StartDate must be after or equal to the epic's startDate.");
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
      const { epicId, startDate } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(epicId)) {
        throw new Error('Invalid epicId.');
      }
  
      const epic = await Epic.findById(epicId);
      if (!epic) {
        throw new Error('Epic not found for this dueDate.');
      }
  
      if (value) {
        const dueDate = new Date(value);
        const epicDueDate = new Date(Epic.dueDate);
  
        if (dueDate > epicDueDate) {
          throw new Error("DueDate must be before or equal to the epic's dueDate.");
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
  
  body('assignedTo')
    .notEmpty().withMessage('AssignedTo is required')
    .isArray().withMessage('AssignedTo must be an array')
    .custom(async (value) => {
      const uniqueMembers = new Set();
  
      for (const userId of value) {
        // Validar que tenga userId y que sea un ObjectId válido
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
          throw new Error('Each user assigned must have a valid userId');
        }
  
        // Validar que exista el usuario en BD
        const user = await User.findById(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} does not exist`);
        }
  
        // Evitar userIds duplicados en el array
        if (uniqueMembers.has(userId.toString())) {
          throw new Error(`User ${userId} is assigned more than once`);
        }
  
        uniqueMembers.add(userId.toString());
      }
  
      return true;
    }),

  validateResult
];

const validateUpdateUserStory = [
  body('versionId')
    .optional({ nullable: true })
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid versionId');
      }
      const version = await Version.findById(value);
      if (!version) {
        throw new Error('Version not found for this versionId');
      }
      return true;
    }),

  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .custom(async (value, { req }) => {
      const userStoryId = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(userStoryId)) {
        throw new Error('Invalid userStoryId.');
      }

      const epic = await Epic.findOne({ 'userStories': userStoryId });

      if (!epic) {
        throw new Error('Epic not found for this userStoryId');
      }

      // Verificar si el nombre del userStory ya existe en esa epic
      const duplicate = epic.userStories.some(userStory => userStory.name === value);

      if (duplicate) {
        throw new Error('Name is already taken');
      }

      return true;
    }),

  body('description')
    .notEmpty().withMessage('Description is required') 
    .isString().withMessage('Description must be a string'),

  body('moscowPriority')
    .optional()
    .custom(async (value, { req }) => {
      const intValue = parseInt(value, 10);
      
      if (isNaN(intValue) || intValue < 1 || intValue > 4) {
        throw new Error('Invalid moscowPriority or must be an integer between 1 y 4.');
      }
      
      const priority = await Priority.findOne({ moscowPriority: intValue });
  
      if (!priority) {
        throw new Error(`Priority not found for moscowPriority ${intValue}`);
      }
      
      if (req.body.priorityId) {
        throw new Error(`Priority not found for moscowPriority ${intValue}`);
      }
      return true;
    }),

  body('startDate')
    .optional()
    .isISO8601().withMessage('Invalid startDate format')
    .toDate()
    .custom(async (value, { req }) => {
      const userStoryId = req.params.id;
      
      // Validar el formato de userStoryId
      if (!mongoose.Types.ObjectId.isValid(userStoryId)) {
        throw new Error('Invalid userStoryId.');
      }

      // Buscar la epica que contiene el userStoryId
      const epic = await Epic.findOne({ 'userStories': userStoryId });

      if (!epic) {
        throw new Error('Epic not found for this startDate');
      }
 
      if (!epic.startDate) {
        throw new Error('Epic does not have a startDate.');
      }

      const { dueDate } = req.body;
  
      // Si no se envió startDate, no continuar validando fechas
      if (!value) return true;
  
      const startDate = new Date(value);
      const epicStartDate = new Date(epic.startDate);
  
      if (startDate < epicStartDate) {
        throw new Error("StartDate must be after or equal to the epic's startDate.");
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
      const userStoryId = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(userStoryId)) {
        throw new Error('Invalid userStoryId.');
      }

      const epic = await Epic.findOne({ 'userStories': userStoryId });

      if (!epic) {
        throw new Error('Epic not found for this dueDate');
      }
  
      if (!epic.dueDate) {
        throw new Error('Epic does not have a dueDate.');
      }

      const { startDate } = req.body;
  
      if (value) {
        const dueDate = new Date(value);
        const epicDueDate = new Date(epic.dueDate);
  
        if (dueDate > epicDueDate) {
          throw new Error("DueDate must be before or equal to the epic's dueDate.");
        }
  
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

  body('status')
    .optional()
    .isIn(['Pendiente', 'En Progreso', 'Completado']).withMessage('Invalid status value'),
  
  body('assignedTo')
    .notEmpty().withMessage('AssignedTo is required')
    .isArray().withMessage('AssignedTo must be an array')
    .custom(async (value) => {
      const uniqueMembers = new Set();
  
      for (const userId of value) {
        // Validar que tenga userId y que sea un ObjectId válido
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
          throw new Error('Each user assigned must have a valid userId');
        }
  
        // Validar que exista el usuario en BD
        const user = await User.findById(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} does not exist`);
        }
  
        // Evitar userIds duplicados en el array
        if (uniqueMembers.has(userId.toString())) {
          throw new Error(`User ${userId} is assigned more than once`);
        }
  
        uniqueMembers.add(userId.toString());
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
  validateCreateUserStory,
  validateUpdateUserStory
};
