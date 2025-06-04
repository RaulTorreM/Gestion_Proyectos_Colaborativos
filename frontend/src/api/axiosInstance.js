import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Enviar token directamente, sin "Bearer "
      config.headers['Authorization'] = token;
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post('http://localhost:4000/api/refresh-token', { refreshToken });

        const newAccessToken = res.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        originalRequest.headers['Authorization'] = newAccessToken;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        data: error.response.data,
        message: error.response.data.message || 'Error en la solicitud'
      });
    }

    return Promise.reject(error);
  }
);

export default api;
