import api from '../axiosInstance';

const ProjectsService = {
  // Obtener todos los proyectos USAR SOLO PARA TESTS
  getProjects: async () => {
    try {
      return await api.get('/projects');
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  // Obtener un proyecto por ID
  getProjectById: async (projectId) => {
    try {
      return await api.get(`/projects/${projectId}`);
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      throw error;
    }
  }

  // Aquí puedes agregar más métodos para crear, actualizar o eliminar proyectos
};

export default ProjectsService;