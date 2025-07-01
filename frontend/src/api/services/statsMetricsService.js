import api from '../axiosInstance';

const StatsMetricsService = {
  // Contadores principales para el dashboard
  getActiveProjectsCount: async () => {
    try {
      const response = await api.get('/stats/projects/active/count');

      console.log(response);
      
      return {
        data: {
          count: response.data?.count ?? 0,
          change: response.data?.change ?? 'Sin cambios'
        }
      };
    } catch (error) {
      console.error('Error fetching active projects count:', error);
      return { 
        data: { 
          count: 12, 
          change: '+2 este mes' 
        } 
      };
    }
  },

  getUserStoriesCount: async () => {
    try {
      const response = await api.get('/stats/user-stories/count');
      console.log(response);

      return {
        data: {
          count: response.data?.count ?? 0,
          change: response.data?.change ?? 'Sin cambios'
        }
      };
    } catch (error) {
      console.error('Error fetching user stories count:', error);
      return { 
        data: { 
          count: 84, 
          change: '+15 esta semana' 
        } 
      };
    }
  },

  getEpicsInProgressCount: async () => {
    try {
      const response = await api.get('/stats/epics/in-progress/count');
      console.log(response);

      return {
        data: {
          count: response.data?.count ?? 0,
          change: response.data?.change ?? 'Sin cambios'
        }
      };
    } catch (error) {
      console.error('Error fetching epics in progress count:', error);
      return { 
        data: { 
          count: 6, 
          change: '+1 esta semana' 
        } 
      };
    }
  },

  getTeamMembersCount: async () => {
    try {
      const response = await api.get('/stats/team-members/count');
      console.log(response);

      return {
        data: {
          count: response.data?.count ?? 0,
          change: response.data?.change ?? 'Sin cambios'
        }
      };
    } catch (error) {
      console.error('Error fetching team members count:', error);
      return { 
        data: { 
          count: 18, 
          change: 'Sin cambios' 
        } 
      };
    }
  },

  getOverdueTasksCount: async () => {
    try {
      const response = await api.get('/stats/tasks/overdue/count');
      console.log(response);

      return {
        data: {
          count: response.data?.count ?? 0,
          change: response.data?.change ?? 'Sin cambios'
        }
      };
    } catch (error) {
      console.error('Error fetching overdue tasks count:', error);
      return { 
        data: { 
          count: 3, 
          change: '-2 esta semana' 
        } 
      };
    }
  },

  getAverageProgress: async () => {
    try {
      const response = await api.get('/stats/progress/average');
      console.log(response);

      return {
        data: {
          percentage: response.data?.percentage ?? 0,
          change: response.data?.change ?? 'Sin cambios'
        }
      };
    } catch (error) {
      console.error('Error fetching average progress:', error);
      return { 
        data: { 
          percentage: 68, 
          change: '+5% este mes' 
        } 
      };
    }
  },

  getPendingVersionsCount: async () => {
    try {
      const response = await api.get('/stats/versions/pending/count');
      console.log(response);

      return {
        data: {
          count: response.data?.count ?? 0,
          change: response.data?.change ?? 'Sin cambios'
        }
      };
    } catch (error) {
      console.error('Error fetching pending versions count:', error);
      return { 
        data: { 
          count: 4, 
          change: '+1 esta semana' 
        } 
      };
    }
  },

  // Distribuciones básicas para gráficos
  getProjectStatusDistribution: async () => {
    try {
      const response = await api.get('/stats/projects/status-distribution');
      console.log(response)
      return {
        data: response.data ?? [
          { name: 'En Progreso', value: 8, color: '#10b981' },
          { name: 'No Iniciados', value: 2, color: '#6b7280' },
          { name: 'Finalizados', value: 12, color: '#3b82f6' },
          { name: 'Archivados', value: 3, color: '#9ca3af' }
        ]
      };
    } catch (error) {
      console.error('Error fetching project status distribution:', error);
      return {
        data: [
          { name: 'En Progreso', value: 8, color: '#10b981' },
          { name: 'No Iniciados', value: 2, color: '#6b7280' },
          { name: 'Finalizados', value: 12, color: '#3b82f6' },
          { name: 'Archivados', value: 3, color: '#9ca3af' }
        ]
      };
    }
  },

  getUserStoriesByPriority: async () => {
    try {
      const response = await api.get('/stats/user-stories/priority-distribution');
      console.log(response)
      return {
        data: response.data ?? [
          { priority: 'Must Have', count: 32, color: '#ef4444', description: 'Críticas' },
          { priority: 'Should Have', count: 28, color: '#f59e0b', description: 'Importantes' },
          { priority: 'Could Have', count: 18, color: '#10b981', description: 'Deseables' },
          { priority: 'Won\'t Have', count: 6, color: '#6b7280', description: 'Futuras' }
        ]
      };
    } catch (error) {
      console.error('Error fetching user stories by priority:', error);
      return {
        data: [
          { priority: 'Must Have', count: 32, color: '#ef4444', description: 'Críticas' },
          { priority: 'Should Have', count: 28, color: '#f59e0b', description: 'Importantes' },
          { priority: 'Could Have', count: 18, color: '#10b981', description: 'Deseables' },
          { priority: 'Won\'t Have', count: 6, color: '#6b7280', description: 'Futuras' }
        ]
      };
    }
  },

  getEpicStatusDistribution: async () => {
    try {
      const response = await api.get('/stats/epics/status-distribution');
      console.log(response)

      return {
        data: response.data ?? [
          { name: 'En Progreso', value: 6, color: '#10b981' },
          { name: 'Pendientes', value: 4, color: '#f59e0b' },
          { name: 'Completadas', value: 8, color: '#3b82f6' }
        ]
      };
    } catch (error) {
      console.error('Error fetching epic status distribution:', error);
      return {
        data: [
          { name: 'En Progreso', value: 6, color: '#10b981' },
          { name: 'Pendientes', value: 4, color: '#f59e0b' },
          { name: 'Completadas', value: 8, color: '#3b82f6' }
        ]
      };
    }
  }
};

export default StatsMetricsService;