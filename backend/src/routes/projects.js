const { Router } = require('express');
const validateObjectId = require('../middlewares/validateObjectId');
const { validateCreateProject, validateUpdateProject, validateDeleteProject } = require('../middlewares/validateProject');
const Project = require('../models/Project');
const Epic = require('../models/Epic');
const UserStory = require('../models/UserStory');
const TeamPerformance = require('../models/TeamPerformance');
const mongoose = require('mongoose');

const router = Router();

const { 
  getProjects, 
  getProject, 
  createProject,
  updateProject, 
  disableProject, 
  deleteProject 
} = require('../controllers/projects.controller');

// Rutas principales de proyectos
router.route('/')
  .get(getProjects)
  .post(validateCreateProject, createProject);

router.route('/:id')
  .all(validateObjectId(Project))
  .get(getProject)
  .put(validateUpdateProject, updateProject);

router.route('/disable/:id')
  .delete(validateObjectId(Project), disableProject);

router.route('/delete/:id')
  .delete(validateObjectId(Project), validateDeleteProject, deleteProject);

// Archivar proyecto
router.post('/:id/archive', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'Archivado', archivedAt: new Date() },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json({ message: 'Proyecto archivado', project });
  } catch (error) {
    console.error('Error al archivar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Reintegrar proyecto (restaurar desde archivado)
router.post('/:id/restore', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'Activo', archivedAt: null },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json({ message: 'Proyecto restaurado', project });
  } catch (error) {
    console.error('Error al restaurar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener proyectos archivados
router.get('/archived', async (req, res) => {
  try {
    const projects = await Project.find({ status: 'Archivado' });
    res.json(projects);
  } catch (error) {
    console.error('Error al obtener proyectos archivados:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Rutas para métricas de proyectos
router.get('/:id/metrics', validateObjectId(Project), async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    const epics = await Epic.find({ projectId });
    const epicIds = epics.map(epic => epic._id);
    const userStories = await UserStory.find({ epicId: { $in: epicIds } });
    
    const totalStories = userStories.length;
    const completedStories = userStories.filter(us => us.status === 'Completado').length;
    const progress = totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0;
    
    const onTimeEpics = epics.filter(epic => 
      epic.status === 'Completado' && 
      epic.endDate <= epic.dueDate
    ).length;
    
    res.json({
      progress,
      progressTarget: 85,
      deliveries: {
        actual: epics.length > 0 ? Math.round((onTimeEpics / epics.length) * 100) : 0,
        target: 90
      },
      meetings: {
        actual: 0,
        target: 80
      },
      tests: {
        actual: 0,
        target: 85
      },
      documentation: {
        actual: 0,
        target: 70
      },
      metadata: {
        totalEpics: epics.length,
        completedEpics: epics.filter(e => e.status === 'Completado').length,
        totalUserStories: totalStories,
        completedUserStories: completedStories
      }
    });
    
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:id/progress', validateObjectId(Project), async (req, res) => {
  try {
    const projectId = req.params.id;
    const epics = await Epic.find({ projectId });
    const epicIds = epics.map(epic => epic._id);
    
    const weeklyProgress = await UserStory.aggregate([
      {
        $match: { 
          epicId: { $in: epicIds },
          createdAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "Completado"] }, 1, 0]
            }
          }
        }
      },
      { 
        $sort: { "_id.year": 1, "_id.week": 1 } 
      },
      {
        $project: {
          _id: 0,
          weekLabel: { 
            $concat: [
              { $toString: "$_id.year" },
              "-W",
              { $toString: "$_id.week" }
            ]
          },
          total: 1,
          completed: 1
        }
      }
    ]);
    
    res.json({
      weeks: weeklyProgress.map(w => w.weekLabel),
      completedTasks: weeklyProgress.map(w => w.completed),
      totalTasks: weeklyProgress.map(w => w.total)
    });
    
  } catch (error) {
    console.error('Error al obtener progreso semanal:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:id/performance', validateObjectId(Project), async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Verificar si la colección existe
    const collections = await mongoose.connection.db.listCollections().toArray();
    const hasTeamPerformance = collections.some(c => c.name === 'teamperformances');
    
    if (!hasTeamPerformance) {
      return res.status(501).json({
        warning: 'La colección TEAM_PERFORMANCE no está implementada',
        suggestion: 'Implemente esta colección para métricas de rendimiento reales',
        exampleData: {
          labels: ['Productividad', 'Calidad', 'Colaboración', 'Puntualidad', 'Innovación'],
          datasets: [{
            data: [85, 78, 92, 80, 65]
          }]
        }
      });
    }

    const performanceData = await TeamPerformance.findOne({ projectId })
      .sort({ evaluationDate: -1 })
      .lean();

    if (!performanceData) {
      return res.status(404).json({
        message: 'No hay datos de rendimiento para este proyecto',
        suggestion: 'Realice una evaluación de rendimiento primero',
        exampleData: {
          labels: ['Productividad', 'Calidad', 'Colaboración', 'Puntualidad', 'Innovación'],
          datasets: [{
            data: [85, 78, 92, 80, 65]
          }]
        }
      });
    }
    
    res.json({
      labels: ['Productividad', 'Calidad', 'Colaboración', 'Puntualidad', 'Innovación'],
      datasets: [{
        data: [
          performanceData.productivityScore,
          performanceData.qualityScore,
          performanceData.collaborationScore,
          performanceData.punctualityScore,
          performanceData.innovationScore
        ]
      }],
      lastUpdated: performanceData.evaluationDate
    });

  } catch (error) {
    console.error('Error al obtener datos de rendimiento:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

module.exports = router;
