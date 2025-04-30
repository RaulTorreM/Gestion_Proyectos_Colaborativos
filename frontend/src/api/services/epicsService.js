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

  getEpicById: async (EpicId) => {
    try {
      return await api.get(`/epics/${EpicId}`);
    } catch (error) {
      console.error('Error fetching epic:', error);
      throw error;
    }
  },

  getEpicsByIds: async (EpicIds) => {
    try {
      return await api.post('/epics/bulk/ids', { ids: EpicIds });
    } catch (error) {
      console.error('Error fetching versions:', error);
      throw error;
    }
  }
};

export default EpicsService;