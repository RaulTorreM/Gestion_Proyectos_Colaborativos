// src/api/services/projectsService.js
import api from '../axiosInstance';

const ProjectsService = {
  // Obtener todos los proyectos (usar solo para tests)
  getProjects: async () => {
    try {
      const response = await api.get('/projects');
      return response;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Obtener un proyecto por ID
  getProjectById: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }
      return response.data || response;
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);

      if (error.response) {
        if (error.response.status === 404) {
          throw new Error('Proyecto no encontrado');
        }
        if (error.response.status === 401) {
          throw new Error('No autorizado para ver este proyecto');
        }
      }

      throw new Error(error.message || 'Error al obtener el proyecto');
    }
  },

  // Crear un proyecto
  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Actualizar un proyecto por ID
  updateProject: async (projectId, updateData) => {
    try {
      const response = await api.put(`/projects/${projectId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${projectId}:`, error);
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error('Proyecto no encontrado para actualizar');
        }
        if (error.response.status === 401) {
          throw new Error('No autorizado para actualizar este proyecto');
        }
      }
      throw new Error(error.message || 'Error al actualizar el proyecto');
    }
  },

  // Archivar un proyecto por ID (actualizado)
  archiveProject: async (projectId) => {
    try {
      const response = await api.post(`/projects/${projectId}/archive`);
      return response.data;
    } catch (error) {
      console.error('Error en archiveProject:', error);
      
      if (error.response) {
        // Si el backend devuelve un mensaje de error
        if (error.response.data?.error) {
          throw new Error(error.response.data.error);
        }
        // Manejo específico de códigos de estado
        if (error.response.status === 404) {
          throw new Error('El endpoint de archivado no existe. Contacta al administrador.');
        }
      }
      
      throw new Error('No se pudo conectar con el servidor para archivar el proyecto');
    }
  },

  // Aquí agrego las nuevas funciones que pediste sin eliminar nada

  // Obtener proyectos activos
  getActiveProjects: async () => {
    try {
      const response = await api.get('/projects?status=Activo');
      return response.data;
    } catch (error) {
      console.error('Error fetching active projects:', error);
      throw error;
    }
  },

  // Obtener proyectos archivados
  getArchivedProjects: async () => {
    try {
      const response = await api.get('/projects/archived');
      return response.data;
    } catch (error) {
      console.error('Error fetching archived projects:', error);
      throw error;
    }
  },

  // Restaurar un proyecto archivado
  restoreProject: async (projectId) => {
    try {
      const response = await api.post(`/projects/${projectId}/restore`);
      return response.data;
    } catch (error) {
      console.error('Error restoring project:', error);
      
      if (error.response) {
        if (error.response.data?.error) {
          throw new Error(error.response.data.error);
        }
        if (error.response.status === 404) {
          throw new Error('El endpoint de restauración no existe. Contacta al administrador.');
        }
      }
      
      throw new Error('No se pudo conectar con el servidor para restaurar el proyecto');
    }
  }
};

export default ProjectsService;
