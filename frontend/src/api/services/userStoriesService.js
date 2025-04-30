import api from '../axiosInstance';

const UserStoriesService = {
  getUserStoriesByEpicId: async (epicId) => {
    try {
      return await api.get(`/userStories/epic/${epicId}`);
    } catch (error) {
      console.error('Error fetching user stories:', error);
      throw error;
    }
  }
};

export default UserStoriesService;