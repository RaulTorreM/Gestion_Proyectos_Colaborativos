const userStoriesController = {};

const User = require('../models/User');
const Epic = require('../models/Epic');
const UserStory = require('../models/UserStory');
const BaseController = require('./base.controller');
const { getUserIdFromToken } = require('../lib/token');
const mongoose = require('mongoose'); 
const Priority = require('../models/Priority');

userStoriesController.getUserStories = async (req, res) => {
  try {
    const userStories = await UserStory.find({ deletedAt: null });

    if (!userStories) {
      return res.status(404).json({ error: 'UserStories not found' });
    }

    res.json(userStories);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

userStoriesController.getUserStory = async (req, res) => {
  try {
    const userStory = await UserStory.findOne({ _id: req.params.id, deletedAt: null });

    if (!userStory) {
      return res.status(404).json({ error: 'UserStory not found' });
    }

    res.json(userStory);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

userStoriesController.getUserStoryByEpic = async (req, res) => {
  try {
    const userStory = await UserStory.find({ epicId: req.params.id, deletedAt: null });

    if (!userStory) {
      return res.json({ userStories: [] });
    }

    res.json(userStory);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

userStoriesController.createUserStory = async (req, res) => {
  try {
    const createData = BaseController.cleanAndAssignDefaults(req.body);
    const userId = getUserIdFromToken(req);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found for this access token' });
    }

    createData.authorUserId = userId;

    const newUserStory = new UserStory(createData);
    await newUserStory.save();

    // Asociar a épica SOLO si hay epicId
    if (createData.epicId) {
      const epic = await Epic.findById(createData.epicId);
      if (epic) {
        epic.userStories.push(newUserStory._id);
        await epic.save();
      }
    }

    res.status(201).json({ message: 'UserStory Saved', data: newUserStory });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

userStoriesController.createUserStoriesBulk = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found for this access token' });
    }

    let stories = Array.isArray(req.body) ? req.body : [req.body];
    if (stories.length === 0) {
      return res.status(400).json({ error: 'No stories provided' });
    }

    const cleanedStories = stories.map(s => {
      const cleaned = BaseController.cleanAndAssignDefaults(s);
      cleaned.authorUserId = userId;
      return cleaned;
    });

    const insertedStories = await UserStory.insertMany(cleanedStories);

    // Agrupar por epicId si existe
    const epicUpdates = {};

    insertedStories.forEach(story => {
      if (story.epicId) {
        if (!epicUpdates[story.epicId]) {
          epicUpdates[story.epicId] = [];
        }
        epicUpdates[story.epicId].push(story._id);
      }
    });

    // Actualizar épicas si corresponde
    const updateEpicPromises = Object.entries(epicUpdates).map(([epicId, storyIds]) =>
      Epic.findByIdAndUpdate(
        epicId,
        { $push: { userStories: { $each: storyIds } } },
        { new: true }
      )
    );
    await Promise.all(updateEpicPromises);

    res.status(201).json({
      message: `${insertedStories.length} UserStories created`,
      data: insertedStories
    });
  } catch (error) {
    console.error('Bulk creation error:', error.message);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

userStoriesController.updateUserStory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const exists = await UserStory.exists({ _id: req.params.id });
    if (!exists) {
      return res.status(404).json({ error: "UserStory no encontrado" });
    }

    const updateData = { ...req.body };

    if (updateData.priorityId) {
      if (!(await Priority.exists({ _id: updateData.priorityId }))) {
        return res.status(400).json({ error: "Prioridad no válida" });
      }
    }

    const userStoryUpdated = await UserStory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('priorityId').exec();

    if (!userStoryUpdated) {
      return res.status(500).json({ error: "La actualización no devolvió datos" });
    }

    res.status(200).json({
      message: 'UserStory Updated',
      userStory: userStoryUpdated
    });
  } catch (error) {
    console.error("Error completo:", error);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

userStoriesController.deleteUserStory = async (req, res) => {
  try {
    const userStory = await UserStory.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!userStory) {
      return res.status(404).json({ error: 'UserStory not found' });
    }

    res.json({ message: 'UserStory Disabled', userStory });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

userStoriesController.getUnassignedUserStoriesByProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const stories = await UserStory.find({
      projectId,
      versionId: null,
      epicId: { $ne: null }, // Solo las que tienen épica
      deletedAt: null
    }).populate('epicId'); // opcional para mostrar nombre de épica

    res.json(stories);
  } catch (error) {
    console.error('Error obteniendo historias sin versión:', error.message);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

module.exports = userStoriesController;
