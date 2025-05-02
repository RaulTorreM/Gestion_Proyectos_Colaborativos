import api from '../axiosInstance';

const AuthService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      console.log(response);
      
      // Guarda token y user en localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getToken: () => localStorage.getItem('accessToken'),

  /* getUser: () => JSON.parse(localStorage.getItem('user')), */
};

export default AuthService;
