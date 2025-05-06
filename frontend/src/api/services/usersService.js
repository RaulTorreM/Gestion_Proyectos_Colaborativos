
import api from '../axiosInstance';

const UsersService = {
  getUserById: async (userId) => {
    try {
      return await api.get(`/users/${userId}`);
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },
  // USAR SOLO PARA TESTS
  getAllUsers: async () => {
    try {
      return await api.get('/users');
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUsersByIds: async (userIds) => {
    try {
      return await api.post('/users/bulk/ids', { ids: userIds });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
};

export default UsersService;