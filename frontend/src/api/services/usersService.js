
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
  }
};

export default UsersService;