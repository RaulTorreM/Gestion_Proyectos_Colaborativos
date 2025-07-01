const Project = require('../models/Project');
const Epic = require('../models/Epic');
const UserStory = require('../models/UserStory');
const User = require('../models/User');
const Version = require('../models/Version');
const mongoose = require('mongoose');

const statsController = {};

// Helper mejorado para manejo de errores
const handleError = (res, error, context) => {
  console.error(`Error en ${context}:`, error);
  res.status(500).json({ 
    success: false,
    error: `Error en ${context}`,
    message: error.message,
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

// Helper para estructura consistente de respuesta
const successResponse = (res, data) => {
  res.json({
    success: true,
    data: data
  });
};

// Calcula el cambio basado en datos históricos
const calculateChange = (current, previous) => {
  if (previous === 0) return 'Nuevo';
  const difference = current - previous;
  const percentage = Math.round((difference / previous) * 100);
  
  if (difference > 0) return `+${difference} (${percentage}%)`;
  if (difference < 0) return `${difference} (${percentage}%)`;
  return 'Sin cambios';
};

// Contadores principales
statsController.getActiveProjectsCount = async (req, res) => {
  try {
    const count = await Project.countDocuments({ 
      status: { $in: ['No Iniciado', 'En Progreso'] },
      deletedAt: null,
      archivedAt: null
    });

    // Datos de la última semana para calcular cambio
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const previousCount = await Project.countDocuments({
      status: { $in: ['No Iniciado', 'En Progreso'] },
      deletedAt: null,
      archivedAt: null,
      createdAt: { $lte: weekAgo }
    });

    successResponse(res, {
      count,
      change: calculateChange(count, previousCount)
    });
  } catch (error) {
    handleError(res, error, 'getActiveProjectsCount');
  }
};

statsController.getUserStoriesCount = async (req, res) => {
  try {
    const count = await UserStory.countDocuments({ 
      deletedAt: null,
      status: { $ne: 'Completado' }
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const previousCount = await UserStory.countDocuments({
      deletedAt: null,
      status: { $ne: 'Completado' },
      createdAt: { $lte: weekAgo }
    });

    successResponse(res, {
      count,
      change: calculateChange(count, previousCount)
    });
  } catch (error) {
    handleError(res, error, 'getUserStoriesCount');
  }
};

statsController.getEpicsInProgressCount = async (req, res) => {
  try {
    const count = await Epic.countDocuments({ 
      status: 'En Progreso',
      deletedAt: null
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const previousCount = await Epic.countDocuments({
      status: 'En Progreso',
      deletedAt: null,
      updatedAt: { $lte: weekAgo }
    });

    successResponse(res, {
      count,
      change: calculateChange(count, previousCount)
    });
  } catch (error) {
    handleError(res, error, 'getEpicsInProgressCount');
  }
};

statsController.getTeamMembersCount = async (req, res) => {
  try {
    const count = await User.countDocuments({ 
      deletedAt: null,
      active: true
    });

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const previousCount = await User.countDocuments({
      deletedAt: null,
      active: true,
      createdAt: { $lte: monthAgo }
    });

    successResponse(res, {
      count,
      change: calculateChange(count, previousCount)
    });
  } catch (error) {
    handleError(res, error, 'getTeamMembersCount');
  }
};

statsController.getOverdueTasksCount = async (req, res) => {
  try {
    const currentDate = new Date();
    const count = await UserStory.countDocuments({
      dueDate: { $lt: currentDate },
      status: { $ne: 'Completado' },
      deletedAt: null
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const previousCount = await UserStory.countDocuments({
      dueDate: { $lt: weekAgo },
      status: { $ne: 'Completado' },
      deletedAt: null,
      updatedAt: { $lte: weekAgo }
    });

    successResponse(res, {
      count,
      change: calculateChange(count, previousCount)
    });
  } catch (error) {
    handleError(res, error, 'getOverdueTasksCount');
  }
};

statsController.getAverageProgress = async (req, res) => {
  try {
    // Usando agregación para mejor performance
    const result = await Project.aggregate([
      { 
        $match: { 
          deletedAt: null,
          archivedAt: null
        } 
      },
      {
        $lookup: {
          from: 'epics',
          localField: '_id',
          foreignField: 'projectId',
          as: 'epics',
          pipeline: [
            { $match: { deletedAt: null } }
          ]
        }
      },
      {
        $lookup: {
          from: 'userstories',
          localField: 'epics._id',
          foreignField: 'epicId',
          as: 'stories',
          pipeline: [
            { $match: { deletedAt: null } }
          ]
        }
      },
      {
        $project: {
          progress: {
            $cond: {
              if: { $gt: [{ $size: '$stories' }, 0] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      { $size: { $filter: { input: '$stories', as: 'story', cond: { $eq: ['$$story.status', 'Completado'] } } } },
                      { $size: '$stories' }
                    ]
                  },
                  100
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          averageProgress: { $avg: '$progress' },
          count: { $sum: 1 }
        }
      }
    ]);

    const percentage = result.length > 0 ? Math.round(result[0].averageProgress) : 0;

    // Comparar con el mes anterior
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const previousResult = await Project.aggregate([
      { 
        $match: { 
          deletedAt: null,
          archivedAt: null,
          updatedAt: { $lte: monthAgo }
        } 
      },
      {
        $lookup: {
          from: 'epics',
          localField: '_id',
          foreignField: 'projectId',
          as: 'epics',
          pipeline: [
            { $match: { deletedAt: null } }
          ]
        }
      },
      {
        $lookup: {
          from: 'userstories',
          localField: 'epics._id',
          foreignField: 'epicId',
          as: 'stories',
          pipeline: [
            { $match: { deletedAt: null } }
          ]
        }
      },
      {
        $project: {
          progress: {
            $cond: {
              if: { $gt: [{ $size: '$stories' }, 0] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      { $size: { $filter: { input: '$stories', as: 'story', cond: { $eq: ['$$story.status', 'Completado'] } } } },
                      { $size: '$stories' }
                    ]
                  },
                  100
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          averageProgress: { $avg: '$progress' }
        }
      }
    ]);
    const previousPercentage = previousResult.length > 0 ? Math.round(previousResult[0].averageProgress) : 0;

    successResponse(res, {
      percentage,
      change: calculateChange(percentage, previousPercentage)
    });
  } catch (error) {
    handleError(res, error, 'getAverageProgress');
  }
};

statsController.getPendingVersionsCount = async (req, res) => {
  try {
    const count = await Version.countDocuments({ 
      status: { $in: ['Planeado', 'En Progreso'] },
      deletedAt: null
    });

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const previousCount = await Version.countDocuments({
      status: { $in: ['Planeado', 'En Progreso'] },
      deletedAt: null,
      createdAt: { $lte: monthAgo }
    });

    successResponse(res, {
      count,
      change: calculateChange(count, previousCount)
    });
  } catch (error) {
    handleError(res, error, 'getPendingVersionsCount');
  }
};

statsController.getTeamVelocity = async (req, res) => {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const completedStories = await UserStory.countDocuments({
      status: 'Completado',
      updatedAt: { $gte: twoWeeksAgo },
      deletedAt: null
    });
    
    const velocity = Math.round(completedStories / 2);

    // Comparar con el periodo anterior
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const previousCompletedStories = await UserStory.countDocuments({
      status: 'Completado',
      updatedAt: { $gte: fourWeeksAgo, $lt: twoWeeksAgo },
      deletedAt: null
    });
    const previousVelocity = Math.round(previousCompletedStories / 2);

    successResponse(res, { 
      velocity, 
      unit: 'historias/semana',
      change: calculateChange(velocity, previousVelocity)
    });
  } catch (error) {
    handleError(res, error, 'getTeamVelocity');
  }
};

// Distribuciones para gráficos
statsController.getProjectStatusDistribution = async (req, res) => {
  try {
    const statusCounts = await Project.aggregate([
      { 
        $match: { 
          deletedAt: null,
          archivedAt: null 
        } 
      },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    const statusMap = {
      'No Iniciado': { color: '#6b7280', name: 'No Iniciados' },
      'En Progreso': { color: '#10b981', name: 'En Progreso' },
      'Finalizado': { color: '#3b82f6', name: 'Finalizados' },
      'Archivado': { color: '#9ca3af', name: 'Archivados' }
    };
    
    const distribution = statusCounts.map(item => ({
      name: statusMap[item._id]?.name || item._id,
      value: item.count,
      color: statusMap[item._id]?.color || '#6b7280'
    }));
    
    successResponse(res, distribution);
  } catch (error) {
    handleError(res, error, 'getProjectStatusDistribution');
  }
};

statsController.getUserStoriesByPriority = async (req, res) => {
  try {
    const userStories = await UserStory.find({ 
      deletedAt: null 
    })
    .populate('priorityId', 'name')
    .lean();
    
    const priorityMap = {};
    
    userStories.forEach(story => {
      const priorityName = story.priorityId?.name || 'Sin Prioridad';
      if (!priorityMap[priorityName]) {
        priorityMap[priorityName] = {
          priority: priorityName,
          count: 0,
          color: '#6b7280',
          description: 'Sin clasificar'
        };
      }
      priorityMap[priorityName].count++;
    });
    
    const colorMap = {
      'Must Have': { color: '#ef4444', description: 'Críticas' },
      'Should Have': { color: '#f59e0b', description: 'Importantes' },
      'Could Have': { color: '#10b981', description: 'Deseables' },
      'Won\'t Have': { color: '#6b7280', description: 'Futuras' }
    };
    
    const distribution = Object.values(priorityMap).map(item => ({
      ...item,
      color: colorMap[item.priority]?.color || item.color,
      description: colorMap[item.priority]?.description || item.description
    }));
    
    successResponse(res, distribution);
  } catch (error) {
    handleError(res, error, 'getUserStoriesByPriority');
  }
};

statsController.getEpicStatusDistribution = async (req, res) => {
  try {
    const epicCounts = await Epic.aggregate([
      { 
        $match: { 
          deletedAt: null 
        } 
      },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    const statusMap = {
      'Pendiente': { color: '#f59e0b', name: 'Pendientes' },
      'En Progreso': { color: '#10b981', name: 'En Progreso' },
      'Completado': { color: '#3b82f6', name: 'Completadas' }
    };
    
    const distribution = epicCounts.map(item => ({
      name: statusMap[item._id]?.name || item._id,
      value: item.count,
      color: statusMap[item._id]?.color || '#6b7280'
    }));
    
    successResponse(res, distribution);
  } catch (error) {
    handleError(res, error, 'getEpicStatusDistribution');
  }
};

statsController.getWeeklyProgress = async (req, res) => {
  try {
    const weeks = parseInt(req.query.weeks) || 6;
    const weeklyData = [];
    
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const completed = await UserStory.countDocuments({
        status: 'Completado',
        updatedAt: { $gte: weekStart, $lte: weekEnd },
        deletedAt: null
      });
      
      const planned = await UserStory.countDocuments({
        createdAt: { $gte: weekStart, $lte: weekEnd },
        deletedAt: null
      });
      
      weeklyData.push({
        week: `Sem ${weeks - i}`,
        completed: completed,
        planned: planned
      });
    }
    
    successResponse(res, weeklyData);
  } catch (error) {
    handleError(res, error, 'getWeeklyProgress');
  }
};

module.exports = statsController;