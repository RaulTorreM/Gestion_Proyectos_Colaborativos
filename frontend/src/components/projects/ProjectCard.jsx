import { useState } from 'react';
import DropdownMenu from '../common/DropdownMenu';
import AvatarGroup from '../common/AvatarGroup';

const ProjectCard = ({ project, onClick }) => {
  const progressPercentage = project.totalTasks > 0 
    ? Math.round((project.completedTasks / project.totalTasks) * 100)
    : 0;

  const getProgressColor = (percentage) => {
    if (percentage < 40) return 'bg-red-600';
    if (percentage < 92) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  const getStatusColor = () => {
    switch(project.status) {
      case 'active': return 'bg-green-900 text-green-300 border-green-600';
      case 'in-progress': return 'bg-yellow-900 text-yellow-300 border-yellow-600';
      case 'completed': return 'bg-gray-900 text-gray-400 border-gray-700';
      default: return 'bg-gray-900 text-gray-400 border-gray-700';
    }
  };

  const getStatusText = () => {
    switch(project.status) {
      case 'active': return 'Activo';
      case 'in-progress': return 'En progreso';
      case 'completed': return 'Completado';
      default: return 'Inactivo';
    }
  };

  return (
    <div 
      className="bg-black-900 rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-300 shadow-lg cursor-pointer"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-white">{project.name}</h3>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{project.description}</p>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu items={[
              { 
                label: 'Ver Detalles', 
                action: onClick,
                icon: <EyeIcon />
              },
              { 
                label: 'Ver Versiones', 
                action: () => console.log('Ver versiones:', project._id),
                icon: <VersionIcon />
              },
              { 
                label: 'Tablero Kanban', 
                action: () => console.log('Kanban:', project._id),
                icon: <KanbanIcon />
              },
              { 
                label: 'Ver Cronograma', 
                action: () => console.log('Cronograma:', project._id),
                icon: <CalendarIcon />
              },
            ]} />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            <span className="text-sm font-bold text-white">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressColor(progressPercentage)}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-xs font-bold text-gray-500">Fecha límite</p>
              <p className="text-sm font-bold text-white">
                {new Date(project.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">Tareas</p>
              <p className="text-sm font-bold text-white">
                {project.completedTasks}/{project.totalTasks}
              </p>
            </div>
          </div>
          <AvatarGroup users={project.members} limit={3} />
        </div>
      </div>
    </div>
  );
};

// Componentes de iconos (sin cambios)
const EyeIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const VersionIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

const KanbanIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default ProjectCard;