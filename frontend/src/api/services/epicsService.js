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
  },

  createEpic: async (epicData) => {
    try {
      const response = await api.post('/epics/', epicData);
      return response;
    } catch (error) {
      console.error('Error creating epic:', error);
      throw error;
    }
  },

  updateEpic: async (epicId, epicData) => {
    try {
      // Eliminar campos no actualizables usando destructuring
      const {
        _id, 
        __v, 
        createdAt, 
        authorUserId,
        projectId,
        ...cleanData
      } = epicData;
  
      const response = await api.put(`/epics/${epicId}`, cleanData);
      return response;
    } catch (error) {
      console.error('Error updating epic:', error);
      throw error;
    }
  },

  deleteEpic: async (epicId) => {
    try {
      const response = await api.delete(`/epics/${epicId}`);
      return response;
    } catch (error) {
      console.error('Error deleting epic:', error);
      throw error;
    }
  },

  getEpicUserStories: async (epicId) => {
    try {
      const response = await api.get(`/epics/${epicId}/user-stories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching epic user stories:', error);
      throw error;
    }
  },

  getEpicsStatsByProject: async (projectId) => {
    try {
      const response = await api.get(`/epics/project/${projectId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project stats:', error);
      throw error;
    }
  },

  searchEpics: async (projectId, searchTerm) => {
    try {
      const response = await api.get(`/epics/project/${projectId}/search`, {
        params: { q: searchTerm }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching epics:', error);
      throw error;
    }
  }
};

export default EpicsService;