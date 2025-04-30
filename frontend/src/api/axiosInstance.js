import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // URL base de tu backend
  timeout: 10000, // Tiempo máximo de espera para las solicitudes
  headers: {
    'Content-Type': 'application/json',
    // HEADERS
  }
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // El servidor respondió con un status code fuera del rango 2xx
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