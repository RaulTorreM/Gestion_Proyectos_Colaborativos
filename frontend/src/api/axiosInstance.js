import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para añadir el token en cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores y refresh-token
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Si es un 401 y no hemos intentado refrescar antes
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await api.post('/refresh-token', { refreshToken: refreshToken });

        const newAccessToken = res.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        // Actualiza el token en la solicitud original
        originalRequest.headers['Authorization'] = `${newAccessToken}`;

        // Reintenta la solicitud original
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, limpia sesión y redirige a login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Manejo global de otros errores
    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        data: error.response.data,
        message: error.response.data.message || 'Error en la solicitud'
      });
    }

    // Si el error no tiene respuesta (por ejemplo, error de red)
    return Promise.reject(error);
  }
);

export default api;
