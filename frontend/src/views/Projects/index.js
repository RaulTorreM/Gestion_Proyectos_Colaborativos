import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import ProjectsList from './ProjectsList';
import CreateProjectModal from './components/CreateProjectModal';
import ProjectDetail from './components/ProjectDetail';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const Projects = () => {
  // CONEXIÓN BACKEND #1 - Estado para almacenar los proyectos
  const [projects, setProjects] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { projectId } = useParams();

  // CONEXIÓN BACKEND #2 - Cargar proyectos al montar el componente
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Llamada real al backend (descomentar en producción)
        // const response = await fetch('/api/projects');
        // if (!response.ok) throw new Error('Error al cargar proyectos');
        // const data = await response.json();
        
        // Datos simulados (eliminar en producción)
        const mockProjects = [
          {
            id: 1,
            name: 'Sistema de Gestión',
            description: 'Desarrollo de un sistema integral para gestión de clientes y ventas con dashboard interactivo.',
            startDate: '2023-01-15',
            endDate: '2023-06-30',
            progress: 65,
            members: [
              { id: 1, name: 'Ana López', avatar: 'https://i.pravatar.cc/150?img=1', role: 'Desarrollador' },
              { id: 2, name: 'Carlos Ruiz', avatar: 'https://i.pravatar.cc/150?img=2', role: 'Diseñador' }
            ]
          },
          {
            id: 2,
            name: 'App Móvil',
            description: 'Aplicación móvil multiplataforma para seguimiento de fitness y nutrición.',
            startDate: '2023-03-10',
            endDate: '2023-09-15',
            progress: 30,
            members: [
              { id: 3, name: 'María García', avatar: 'https://i.pravatar.cc/150?img=3', role: 'Desarrollador' },
              { id: 4, name: 'Juan Pérez', avatar: 'https://i.pravatar.cc/150?img=4', role: 'QA' },
              { id: 5, name: 'Luisa Martínez', avatar: 'https://i.pravatar.cc/150?img=5', role: 'Product Owner' }
            ]
          }
        ];
        
        setProjects(mockProjects); // En producción usar: setProjects(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error('Error fetching projects:', err);
        // Mostrar notificación de error al usuario
      }
    };

    fetchProjects();
  }, []);

  // CONEXIÓN BACKEND #3 - Crear nuevo proyecto
  const handleCreateProject = async (newProject) => {
    try {
      // Llamada real al backend (descomentar en producción)
      // const response = await fetch('/api/projects', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: newProject.name,
      //     description: newProject.description,
      //     startDate: newProject.startDate,
      //     endDate: newProject.endDate
      //   })
      // });
      // const createdProject = await response.json();
      
      // Simulación de respuesta del backend (eliminar en producción)
      const createdProject = {
        ...newProject,
        id: Date.now(), // ID generado por el backend en producción
        progress: 0,    // Valor inicial
        members: [],    // Array vacío inicial
        createdAt: new Date().toISOString()
      };
      
      setProjects([...projects, createdProject]);
      setOpenModal(false);
      navigate(`/proyectos/${createdProject.id}`);
      
      // Mostrar notificación de éxito
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Error al crear el proyecto');
      // Mostrar notificación de error al usuario
    }
  };

  // CONEXIÓN BACKEND #4 - Actualizar proyecto
  const handleUpdateProject = async (updatedProject) => {
    try {
      // Llamada real al backend (descomentar en producción)
      // const response = await fetch(`/api/projects/${updatedProject.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedProject)
      // });
      // const data = await response.json();
      
      // Simulación de actualización (eliminar en producción)
      setProjects(projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      ));
      
      // Mostrar notificación de éxito
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Error al actualizar el proyecto');
      // Mostrar notificación de error al usuario
    }
  };

  // Vista de lista de proyectos
  const ProjectsListView = () => (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Mis Proyectos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          disabled={loading}
        >
          Nuevo Proyecto
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Typography>Cargando proyectos...</Typography>
      ) : (
        <>
          <ProjectsList projects={projects} />
          <CreateProjectModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            onCreate={handleCreateProject}
          />
        </>
      )}
    </Box>
  );

  // Renderizado condicional según la ruta
  return (
    <>
      {projectId ? (
        <ProjectDetail 
          project={projects.find(p => p.id === parseInt(projectId)) || null} 
          onUpdate={handleUpdateProject}
        />
      ) : (
        <ProjectsListView />
      )}
      <Outlet />
    </>
  );
};

export default Projects;