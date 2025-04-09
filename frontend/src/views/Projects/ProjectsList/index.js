import React from 'react';
import { Grid, Typography, Card } from '@mui/material';
import { Link } from 'react-router-dom';
import ProjectCard from '../ProjectCard';

/**
 * Componente ProjectsList - Muestra una lista de proyectos en formato grid
 * 
 * PROPS:
 * @param {Array} projects - Lista de proyectos a mostrar
 *    Cada proyecto debe tener:
 *    - id: Identificador único (requerido para el key y navegación)
 *    - name: Nombre del proyecto
 *    - description: Descripción breve
 *    - startDate: Fecha de inicio (formato ISO)
 *    - endDate: Fecha de fin (formato ISO)
 *    - progress: Porcentaje de progreso (0-100)
 *    - members: Array de miembros del proyecto
 * 
 * CONEXIONES BACKEND:
 * - Recibe los proyectos como prop desde el componente padre (Projects.js)
 * - Los proyectos deben venir del endpoint GET /api/projects
 * - Cada card redirige al detalle del proyecto (/proyectos/:id)
 */
const ProjectsList = ({ projects = [] }) => {
  // Manejo cuando no hay proyectos
  if (!projects || projects.length === 0) {
    return (
      <Typography variant="body1" sx={{ p: 3 }}>
        No hay proyectos disponibles
      </Typography>
    );
  }

  return (
    <Grid container spacing={3} sx={{ width: '100%' }}>
      {projects.map((project) => (
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={4} 
          key={project.id} // IMPORTANTE: Usar ID único del backend
          sx={{
            display: 'flex',
            minWidth: { xs: '100%', sm: '350px', md: '350px' },
            maxWidth: { xs: '100%', sm: '350px', md: '350px' }
          }}
        >
          {/* Cada proyecto es un Card que enlaza al detalle */}
          <Card 
            component={Link}
            to={`/proyectos/${project.id}`} // Navegación usando el ID del proyecto
            sx={{ 
              width: '100%',
              textDecoration: 'none',
              '&:hover': {
                boxShadow: 3 // Efecto hover visual
              }
            }}
          >
            {/* Componente ProjectCard que muestra la información del proyecto */}
            <ProjectCard project={project} />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProjectsList;