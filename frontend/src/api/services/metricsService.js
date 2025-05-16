import api from '../axiosInstance'; 

const MetricsService = {
  getProjectMetrics: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/metrics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project metrics:', error);
      throw error;
    }
  },

  getWeeklyProgress: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly progress:', error);
      throw error;
    }
  }
};

export default MetricsService;