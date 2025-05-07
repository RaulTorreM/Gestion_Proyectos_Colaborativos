import api from '../axiosInstance';

const AuthService = {
  // Login: recibe credenciales y maneja respuesta
  login: async (credentials) => {
    try {
      const { accessToken, refreshToken /*, user */ } = await api.post('/login', credentials);

      // Guarda los tokens en localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Si el backend devuelve datos de usuario, puedes guardarlo también
      // localStorage.setItem('user', JSON.stringify(user));

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  getLoggedUser: async () => {
    try {
      const loggedUser = await api.get('/logged');
      return loggedUser;
    } catch (error) {
      console.error(`Error fetching current logged user: `, error);
      throw error;
    }
  },

  // Logout: envía refresh token, limpia localStorage
  logout: async () => {
    try {
      const refreshToken = AuthService.getRefreshToken();
      await api.post('/logout', { refreshToken: refreshToken });

      AuthService.clearSession();
    } catch (error) {
      console.error('Error en logout:', error);
      // Igual limpia sesión por seguridad
      AuthService.clearSession();
    }
  },

  getAccessToken: () => localStorage.getItem('accessToken'),

  getRefreshToken: () => localStorage.getItem('refreshToken'),

  clearSession: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // localStorage.removeItem('user');
  },
};

export default AuthService;
