const projectsController = {};

const User = require('../models/User');
const Project = require('../models/Project');
const BaseController = require('./base.controller');
const { getUserIdFromToken } = require('../lib/token');

projectsController.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ deletedAt: null });

    if (!projects) {
      return res.status(404).json({ error: 'Projects not found' });
    }

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

projectsController.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, deletedAt: null });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

projectsController.createProject = async (req, res) => {
  try {
    const createData = BaseController.cleanAndAssignDefaults(req.body);
    const userId = getUserIdFromToken(req);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found for this access token' });
    }

    createData.authorUserId = userId;

    const newProject = new Project(createData);
    await newProject.save();

    user.projects.push(newProject._id);
    await user.save();

    res.status(201).json({ message: 'Project Saved', data: newProject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

projectsController.updateProject = async (req, res) => {
  try {
    const updateData = BaseController.cleanAndAssignDefaults(req.body);

    const projectUpdated = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!projectUpdated) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectObject = projectUpdated.toObject();

    res.status(200).json({ message: 'Project Updated', user: projectObject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

projectsController.disableProject = async (req, res) => {
  try {
    const projectDisabled = await Project.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!projectDisabled) {
      return res.status(404).json({ error: 'Project to disable not found' });
    }

    res.json({ message: 'Project Disabled', data: projectDisabled });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

projectsController.deleteProject = async (req, res) => {
  try {
    const projectDeleted = await Project.findByIdAndDelete(req.params.id);

    if (!projectDeleted) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project Deleted', data: projectDeleted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error: ' + error.message });
  }
};

// Función actualizada para archivar proyecto con validación de permisos
projectsController.archiveProject = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Verificar que el proyecto existe
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // 2. Verificar permisos (autor o admin)
    if (
      project.authorUserId.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ error: 'No autorizado para archivar este proyecto' });
    }

    // 3. Actualizar el proyecto
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        status: 'Archivado',
        archivedAt: new Date(),
        archivedBy: req.user._id,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Proyecto archivado correctamente',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Error en archiveProject:', error);
    res.status(500).json({
      error: 'Error al archivar el proyecto',
      details: error.message,
    });
  }
};

module.exports = projectsController;
