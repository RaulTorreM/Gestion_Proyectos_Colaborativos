import api from '../axiosInstance';

const EpicsService = {
  getEpicsByProjectId: async (projectId) => {
    try {
      return await api.get(`/epics/project/${projectId}`);
    } catch (error) {
      console.error('Error fetching epics:', error);
      throw error;
    }
  },

  getEpicById: async (epicId) => {
    try {
      return await api.get(`/epics/${epicId}`);
    } catch (error) {
      console.error('Error fetching epic:', error);
      throw error;
    }
  },

  getEpicsByIds: async (epicIds) => {
    try {
      return await api.post('/epics/bulk/ids', { ids: epicIds });
    } catch (error) {
      console.error('Error fetching versions:', error);
      throw error;
    }
  }
};

export default EpicsService;