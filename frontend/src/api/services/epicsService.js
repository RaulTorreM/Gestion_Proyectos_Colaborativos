import api from '../axiosInstance';

const EpicsService = {
  getEpicsByProjectId: async (projectId) => {
    try {
      return await api.get(`/epics/project/${projectId}`);
    } catch (error) {
      console.error('Error fetching epics:', error);
      throw error;
    }
  }
};

export default EpicsService;