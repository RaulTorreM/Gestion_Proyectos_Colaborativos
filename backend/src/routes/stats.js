const { Router } = require('express');
const router = Router();

const {
  getActiveProjectsCount,
  getUserStoriesCount,
  getEpicsInProgressCount,
  getTeamMembersCount,
  getOverdueTasksCount,
  getAverageProgress,
  getPendingVersionsCount,
  getTeamVelocity,
  getProjectStatusDistribution,
  getUserStoriesByPriority,
  getEpicStatusDistribution,
  getWeeklyProgress
} = require('../controllers/stats.controller');

// Rutas para contadores principales
router.get('/projects/active/count', getActiveProjectsCount);
router.get('/user-stories/count', getUserStoriesCount);
router.get('/epics/in-progress/count', getEpicsInProgressCount);
router.get('/team-members/count', getTeamMembersCount);
router.get('/tasks/overdue/count', getOverdueTasksCount);
router.get('/progress/average', getAverageProgress);
router.get('/versions/pending/count', getPendingVersionsCount);
router.get('/team/velocity', getTeamVelocity);

// Rutas para distribuciones y gráficos
router.get('/projects/status-distribution', getProjectStatusDistribution);
router.get('/user-stories/priority-distribution', getUserStoriesByPriority);
router.get('/epics/status-distribution', getEpicStatusDistribution);
router.get('/progress/weekly', getWeeklyProgress);

module.exports = router;