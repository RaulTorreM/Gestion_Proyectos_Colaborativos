import api from '../axiosInstance';

const ProjectsService = {
  // Obtener todos los proyectos USAR SOLO PARA TESTS
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
  }
};

export default ProjectsService;
