const { body } = require('express-validator');
const validateResult = require('./validateResult');
const moment = require('moment-timezone');
const User = require('../models/User');
const UserStory = require('../models/UserStory');
const Comment = require('../models/Comment');

const validateCreateComment = [
  body('userStoryId')
    .notEmpty().withMessage('UserStoryId is required')
    .custom(async (value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid userStoryId');
      }

      const userStory = await UserStory.findOne({ _id: value, deletedAt: null });
      if (!userStory) {
        throw new Error('User Story not found for this UserStoryId');
      }
      return true;
    }),

  body('text')
    .notEmpty().withMessage('Text is required') 
    .isString().withMessage('Text must be a string'),

  body('mentions')
    .nullable({ nullable: true })
    .isArray().withMessage('Mentions must be an array')
    .custom(async (value) => {
      if (value) {
        const mentionValidationPromises = value.map(async (userId) => {
          // Verificar que el id de usuario sea válido
          if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Each mention must have a valid user id');
          }

          // Buscar el User por el userId
          const user = await User.findById(userId);
          if (!user) {
            throw new Error(`User with ID ${userId} does not exist`);
          }
        });

        // Esperar que todas las validaciones se resuelvan
        await Promise.all(mentionValidationPromises);
      }
      return true;
    }),

  validateResult
];

const validateUpdateComment = [
  body('text')
    .optional()
    .isString().withMessage('Text must be a string'),

  body('mentions')
    .optional({ nullable: true })
    .isArray().withMessage('Mentions must be an array')
    .custom(async (value, { req }) => {
      if (value) {
        const commentId = req.params.id;
        const comment = await Comment.findById(commentId);

        if (!comment) {
          throw new Error('Comment not found');
        }

        const existingMentions = comment.mentions.map(m => m.toString());

        // Validar que todos los ids en value sean válidos y existan
        const mentionValidationPromises = value.map(async (userId) => {
          if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Each mention must have a valid user id');
          }

          const user = await User.findById(userId);
          if (!user) {
            throw new Error(`User with ID ${userId} does not exist`);
          }
        });

        await Promise.all(mentionValidationPromises);

        // Fusionar menciones existentes con las nuevas y eliminar duplicados
        const mergedMentions = [...new Set([...existingMentions, ...value])];

        // Actualizar req.body.mentions con la lista limpia
        req.body.mentions = mergedMentions;
      }
      return true;
    }),

  validateResult
];

module.exports = {
  validateCreateComment,
  validateUpdateComment
};
