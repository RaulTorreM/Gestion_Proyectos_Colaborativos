import api from '../axiosInstance';

const UserStoriesService = {
  createUserStory: async (storyData) => {
    try {
      if (!Array.isArray(storyData.assignedTo)) {
        storyData.assignedTo = [];
      }
      const response = await api.post('/userStories', storyData);
      return response.data;
    } catch (error) {
      console.error('Error creating user story:', error);
      throw error;
    }
  },

  createUserStoriesBulk: async (storiesData) => {
    try {
      const response = await api.post('/userStories/create/bulk', storiesData);
      return response.data;
    } catch (error) {
      console.error('Error creating user stories (bulk):', error);
      throw error;
    }
  },

  updateUserStory: async (storyId, storyData) => {
    try {
      const response = await api.put(`/userStories/${storyId}`, storyData);
      return response;
    } catch (error) {
      console.error('Error updating user story:', error);
      throw error;
    }
  },

  deleteUserStory: async (storyId) => {
    try {
      const response = await api.delete(`/userStories/${storyId}`);
      return response;
    } catch (error) {
      console.error('Error deleting user story:', error);
      throw error;
    }
  },

  getUserStoriesByEpic: async (epicId) => {
    try {
      const response = await api.get(`/userStories/epic/${epicId}`);
      return response;
    } catch (error) {
      console.error('Error fetching user stories:', error);
      throw error;
    }
  },

  getUserStoriesByProject: async (projectId) => {
    try {
      const response = await api.get(`/userStories/by-project/${projectId}`);
      return response;
    } catch (error) {
      console.error('Error fetching user stories by project:', error);
      throw error;
    }
  }
  
};

export default UserStoriesService;
