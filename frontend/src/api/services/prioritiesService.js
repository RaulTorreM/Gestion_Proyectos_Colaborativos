import api from '../axiosInstance';

const PrioritiesService = {
  getPriorities: async () => {
    try {
      const response = await api.get('/priorities');
      return response;
    } catch (error) {
      console.error('Error fetching priorities:', error);
      throw error;
    }
  },

  getMoscowPriorities: async () => {
    try {
      const response = await api.get('/priorities/moscow');
      return response;
    } catch (error) {
      console.error('Error fetching moscow priorities:', error);
      throw error;
    }
  },

  getNoMoscowPriorities: async () => {
    try {
      const response = await api.get('/priorities/noMoscow');
      return response;
    } catch (error) {
      console.error('Error fetching no moscow priorities:', error);
      throw error;
    }
  },

  getPriorityById: async (priorityId) => {
    try {
      const response = await api.get(`/priorities/${priorityId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching priority ${priorityId}:`, error);
      throw error;
    }
  },

  getPriorityByMoscowNumber: async (moscowNumber) => {
    try {
      const response = await api.get(`/priorities/moscowPriority/${moscowNumber}`);
      return response;
    } catch (error) {
      console.error(`Error fetching priority ${priorityId}:`, error);
      throw error;
    }
  },

  getPrioritiesByIds: async (prioritiesIds) => {
    try {
      return await api.post('/priorities/bulk/ids', { ids: prioritiesIds });
    } catch (error) {
      console.error('Error fetching versions:', error);
      throw error;
    }
  }
};

export default PrioritiesService;