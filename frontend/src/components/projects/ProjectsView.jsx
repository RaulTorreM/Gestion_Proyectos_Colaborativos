import { useState } from 'react';
import { useProjects } from '../../context/ProjectsContext';
import ProjectCard from './ProjectCard';
import ProjectList from './ProjectList';
import LoadingSpinner from '../common/LoadingSpinner';
import ProjectDetailView from './ProjectDetail/ProjectDetailView';

const ProjectsView = () => {
  const { projects, loading, viewMode } = useProjects();
  const [selectedProject, setSelectedProject] = useState(null);

  if (loading) return <LoadingSpinner />;

  // Si hay un proyecto seleccionado, mostramos la vista de detalles
  if (selectedProject) {
    return (
      <ProjectDetailView 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)} 
      />
    );
  }

  // Vista normal de lista o tarjetas
  return (
    <div className="mt-4">
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard 
              key={project._id} 
              project={project} 
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      ) : (
        <ProjectList 
          projects={projects} 
          onProjectClick={setSelectedProject}
        />
      )}
    </div>
  );
};

export default ProjectsView;