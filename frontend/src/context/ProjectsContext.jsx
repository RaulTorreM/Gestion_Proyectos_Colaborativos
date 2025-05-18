// src/components/context/ProjectsContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ProjectsContext = createContext();

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/projects');
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar proyectos');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const archiveProject = async (projectId) => {
    try {
      await axios.delete(`/api/projects/disable/${projectId}`);
      setProjects(prevProjects => prevProjects.filter(project => project._id !== projectId));
      return true;
    } catch (err) {
      console.error('Error archiving project:', err);
      setError(err.response?.data?.error || 'Error al archivar proyecto');
      return false;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <ProjectsContext.Provider value={{ 
      projects, 
      loading, 
      error, 
      fetchProjects, 
      archiveProject 
    }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects debe usarse dentro de un ProjectsProvider');
  }
  return context;
};