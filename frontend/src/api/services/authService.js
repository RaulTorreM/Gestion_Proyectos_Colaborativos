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

  // Obtiene access token
  getAccessToken: () => localStorage.getItem('accessToken'),

  // Obtiene refresh token
  getRefreshToken: () => localStorage.getItem('refreshToken'),

  // Limpia todos los datos de sesión
  clearSession: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // localStorage.removeItem('user');
  },

  // Si deseas: obtener usuario
  // getUser: () => JSON.parse(localStorage.getItem('user')),
};

export default AuthService;
