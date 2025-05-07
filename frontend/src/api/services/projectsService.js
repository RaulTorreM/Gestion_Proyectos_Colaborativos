import api from '../axiosInstance';
import AuthService from './authService';

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

  getProjectsByLoggedUser: async () => {
    try {
      const loggedUser = await AuthService.getLoggedUser();
      const response = await api.get(`/projects/user/${loggedUser._id}`);
      
      return response;
    } catch (error) {
      console.error('Error fetching projects by userId:', error);
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
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  getProjectByEpicId: async (epicId) => {
    try {
      return await api.get(`/projects/epic/${epicId}`);
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }
};

export default ProjectsService;