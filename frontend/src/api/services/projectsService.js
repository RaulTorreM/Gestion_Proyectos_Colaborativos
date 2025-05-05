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
      return response;
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      throw error;
    }
  },

  // Crear un proyecto
  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
};

export default ProjectsService;