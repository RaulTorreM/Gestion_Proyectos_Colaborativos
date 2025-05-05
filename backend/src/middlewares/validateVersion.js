const { body } = require('express-validator');
const mongoose = require('mongoose');
const validateResult = require('./validateResult');
const User = require('../models/User');
const Project = require('../models/Project');
const Epic = require('../models/Epic');
const Version = require('../models/Version');
const Priority = require('../models/Priority');
const UserStory = require('../models/UserStory');

const validateCreateVersion = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .custom(async (value,  { req }) => {
      const { projectId } = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid projectId.');
      }

      const project = await Project.findById(projectId);
     
      if (!project) {
        throw new Error('Project not found for this projectId');
      }

      const duplicate = project.versions.find(userStory => userStory.name === value);

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
      const {releaseDate, projectId } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid projectId.');
      }
  
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found for this startDate.');
      }
  
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
  
      // Si se envió releaseDate, validar diferencia mínima de 1 día
      if (releaseDate) {
        const releaseDateParsed = new Date(releaseDate);
        const diffTime = releaseDateParsed.getTime() - startDate.getTime();
        const oneDayInMs = 24 * 60 * 60 * 1000;
  
        if (diffTime < oneDayInMs) {
          throw new Error('StartDate must be at least 1 day before releaseDate.');
        }
      }
  
      return true;
    }),

  body('status')
    .optional({ nullable: true })
    .isIn(['Planeado', 'En Progreso', 'Lanzado']).withMessage('Invalid status value'),
  
  body('releaseDate')
    .notEmpty().withMessage('ReleaseDate is required') 
    .isISO8601().withMessage('Invalid releaseDate format')
    .toDate()
    .custom(async (value, { req }) => {
      const { startDate, projectId} = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid projectId.');
      }
  
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found for this startDate.');
      }

      if (value) {
        const releaseDate = new Date(value);
     
        // Si se envió startDate, validar diferencia mínima de 1 día
        if (startDate) {
          const startDateParsed = new Date(startDate);
          const diffTime = releaseDate.getTime() - startDateParsed.getTime();
          const oneDayInMs = 24 * 60 * 60 * 1000;
  
          if (diffTime < oneDayInMs) {
            throw new Error('ReleaseDate must be at least 1 day after startDate.');
          }
        } else {
          const diffTime = releaseDate.getTime() - new Date();
          const oneDayInMs = 24 * 60 * 60 * 1000;
  
          if (diffTime < oneDayInMs) {
            throw new Error('ReleaseDate must be at least 1 day after now.');
          }
        }
           
        if (project.endDate && releaseDate > new Date(project.endDate)) {
          throw new Error("ReleaseDate must be before or equal to the project's endDate.");
        }
      }
  
      return true;
    }),
  
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
    
  body('userStories')
    .notEmpty().withMessage('UserStories is required')
    .isArray().withMessage('UserStories must be an array')
    .custom(async (value, { req }) => {
      if (value) {
        const { projectId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
          throw new Error('Invalid projectId');
        }
  
        const project = await Project.findById(projectId);
        if (!project) {
          throw new Error('Project not found for this projectId');
        }
        
        const uniqueIds = new Set(value);
        if (uniqueIds.size !== value.length) {
          throw new Error('Duplicate userStory IDs are not allowed');
        }
  
        const userStoriesValidationPromises = value.map(async (userStoryId) => {
          if (!mongoose.Types.ObjectId.isValid(userStoryId)) {
            throw new Error('Each userStory must have a valid id');
          }
  
          const userStory = await UserStory.findById(userStoryId);
          if (!userStory) {
            throw new Error(`UserStory with ID ${userStoryId} does not exist`);
          }
          
          const exists = await Epic.exists({
            _id: { $in: project.epics },
            userStories: userStoryId
          });
          
          if (!exists) {
            throw new Error(`UserStory with ID ${userStoryId} does not belong to any Epic of the project`);
          }
        });
  
        await Promise.all(userStoriesValidationPromises);
      }
  
      return true;
    }),

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

const validateUpdateVersion = [
  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .custom(async (value, { req }) => {
      const versionId = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(versionId)) {
        throw new Error('Invalid versionId.');
      }

      const project = await Project.findOne({ 'versions': versionId });

      if (!project) {
        throw new Error('Project not found for this versionId');
      }

      const duplicate = project.versions.some(version => version.name === value);

      if (duplicate) {
        throw new Error('Name is already taken');
      }

      return true;
    }),

  body('description')
    .notEmpty().withMessage('Description is required') 
    .isString().withMessage('Description must be a string'),

  body('startDate')
    .optional()
    .isISO8601().withMessage('Invalid startDate format')
    .toDate()
    .custom(async (value, { req }) => {
      const versionId = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(versionId)) {
        throw new Error('Invalid versionId.');
      }
  
      const project = await Project.findOne({ 'versions': versionId });

      if (!project) {
         throw new Error('Project not found for this versionId');
      }
  
      if (!project.startDate) {
        throw new Error('Project does not have a startDate.');
      }
  
      if (!value) return true;
  
      const startDate = new Date(value);
      const projectStartDate = new Date(project.startDate);
  
      // Validar que startDate sea posterior o igual al startDate del proyecto
      if (startDate < projectStartDate) {
        throw new Error("StartDate must be after or equal to the project's startDate.");
      }
      
      const releaseDate = req.body.releaseDate || await Version.findById(versionId).releaseDate;

      // Si se envió releaseDate, validar diferencia mínima de 1 día
      if (releaseDate) {
        const releaseDateParsed = new Date(releaseDate);
        const diffTime = releaseDateParsed.getTime() - startDate.getTime();
        const oneDayInMs = 24 * 60 * 60 * 1000;
  
        if (diffTime < oneDayInMs) {
          throw new Error('StartDate must be at least 1 day before releaseDate.');
        }
      }
  
      return true;
    }),
  
  body('status')
    .optional()
    .isIn(['Planeado', 'En Progreso', 'Lanzado']).withMessage('Invalid status value'),
  
  body('releaseDate')
    .optional() 
    .isISO8601().withMessage('Invalid releaseDate format')
    .toDate()
    .custom(async (value, { req }) => {
      const versionId = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(versionId)) {
        throw new Error('Invalid versionId.');
      }
  
      const project = await Project.findOne({ 'versions': versionId });
      if (!project) {
        throw new Error('Project not found for this versionId.');
      }

      if (value) {
        const releaseDate = new Date(value);
        const startDate = req.body.startDate || await Version.findById(versionId).startDate;

        // Si se envió startDate, validar diferencia mínima de 1 día
        if (startDate) {
          const startDateParsed = new Date(startDate);
          const diffTime = releaseDate.getTime() - startDateParsed.getTime();
          const oneDayInMs = 24 * 60 * 60 * 1000;
  
          if (diffTime < oneDayInMs) {
            throw new Error('ReleaseDate must be at least 1 day after startDate.');
          }
        } else {
          const diffTime = releaseDate.getTime() - new Date();
          const oneDayInMs = 24 * 60 * 60 * 1000;
  
          if (diffTime < oneDayInMs) {
            throw new Error('ReleaseDate must be at least 1 day after now.');
          }
        }
           
        console.log(project.endDate);

        if (project.endDate && releaseDate > new Date(project.endDate)) {
          throw new Error("ReleaseDate must be before or equal to the project's endDate.");
        }
      }
  
      return true;
    }),

  body('userStories')
    .optional()
    .isArray().withMessage('UserStories must be an array')
    .custom(async (value, { req }) => {
      if (value) {
        const versionId  = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(versionId)) {
          throw new Error('Invalid versionId');
        }
  
        const project = await Project.findOne({ 'versions': versionId });
        if (!project) {
          throw new Error('Project not found for this versionId');
        }
  
        const uniqueIds = new Set(value);
        if (uniqueIds.size !== value.length) {
          throw new Error('Duplicate userStory IDs are not allowed');
        }
  
        const userStoriesValidationPromises = value.map(async (userStoryId) => {
          if (!mongoose.Types.ObjectId.isValid(userStoryId)) {
            throw new Error('Each userStory must have a valid id');
          }
  
          const userStory = await UserStory.findById(userStoryId);
          if (!userStory) {
            throw new Error(`UserStory with ID ${userStoryId} does not exist`);
          }
          
          const exists = await Epic.exists({
            _id: { $in: project.epics },
            userStories: userStoryId
          });
          
          if (!exists) {
            throw new Error(`UserStory with ID ${userStoryId} does not belong to any Epic of the project`);
          }
        });
  
        await Promise.all(userStoriesValidationPromises);
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
  validateCreateVersion,
  validateUpdateVersion
};
