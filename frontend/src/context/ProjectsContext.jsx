import { createContext, useContext, useState, useEffect } from 'react';

const ProjectsContext = createContext();

const mockProjects = [
    {
      _id: '1',
      name: 'Sistema de Gestión de Inventario',
      description: 'Desarrollo de un sistema para gestionar inventario con alertas automáticas',
      status: 'activo',
      startDate: '2023-01-15',
      endDate: '2023-12-15',
      completedTasks: 23,
      totalTasks: 24,
      members: [
        { _id: '101', name: 'Ana López', avatar: '/users/avatars/ana.jpg' },
        { _id: '102', name: 'Carlos Ruiz', avatar: null },
        { _id: '103', name: 'María García', avatar: '/users/avatars/maria.jpg' },
        { _id: '104', name: 'Juan Pérez', avatar: null },
      ],
      createdBy: { _id: '100', name: 'Admin', avatar: null },
      categories: ['Desarrollo', 'Inventario'],
      createdAt: '2023-01-10T10:00:00Z',
      updatedAt: '2023-06-15T14:30:00Z'
    },
    {
      _id: '2',
      name: 'Plataforma de E-learning',
      description: 'Desarrollo de una plataforma educativa con cursos online',
      status: 'activo',
      startDate: '2023-03-01',
      endDate: '2023-11-30',
      completedTasks: 32,
      totalTasks: 45,
      members: [
        { _id: '102', name: 'Carlos Ruiz', avatar: null },
        { _id: '105', name: 'Luisa Fernández', avatar: '/users/avatars/luisa.jpg' },
      ],
      createdBy: { _id: '100', name: 'Admin', avatar: null },
      categories: ['Educación', 'Plataforma'],
      createdAt: '2023-02-20T09:15:00Z',
      updatedAt: '2023-06-10T11:20:00Z'
    },
    
  ];

export const ProjectsProvider = ({ children }) => {
  const [state, setState] = useState({
    projects: [],
    loading: true,
    error: null,
    viewMode: 'cards',
    filters: {}
  });

  const addProject = (newProject) => {
    setState(prev => ({
      ...prev,
      projects: [...prev.projects, {
        ...newProject,
        _id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        status: 'active',
        members: [],
        completedTasks: 0
      }]
    }));
  };

  const fetchProjects = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let filteredProjects = mockProjects;
      if (state.filters.search) {
        filteredProjects = mockProjects.filter(project =>
          project.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
          project.description.toLowerCase().includes(state.filters.search.toLowerCase())
        );
      }
      
      setState(prev => ({ ...prev, projects: filteredProjects }));
    } catch (err) {
      setState(prev => ({ ...prev, error: err.message, projects: mockProjects }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [state.filters]);

  return (
    <ProjectsContext.Provider value={{
      ...state,
      setViewMode: (mode) => setState(prev => ({ ...prev, viewMode: mode })),
      setFilters: (filters) => setState(prev => ({ ...prev, filters })),
      refreshProjects: fetchProjects,
      addProject
    }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectsContext);