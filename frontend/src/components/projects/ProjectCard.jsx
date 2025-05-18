// src/components/projects/ProjectCard.jsx
import ProgressBar from './ProgressBar';
import ProjectActions from './ProjectActions';
import UsersService from '../../api/services/usersService';
import EpicsService from '../../api/services/epicsService';
import UserStoriesService from '../../api/services/userStoriesService';
import { useState, useEffect } from 'react';

// Función para formatear fecha ISO sin errores de huso horario
const formatUTCDate = (isoString) => {
  if (!isoString) return 'No definida';
  
  try {
    const date = new Date(isoString);
    date.setHours(date.getHours() + 5); // Ajuste zona horaria si es necesario

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

const ProjectCard = ({ project, theme, onArchive }) => {
  const [managerName, setManagerName] = useState('Desconocido');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await UsersService.getUserById(project.authorUserId);
        setManagerName(user.name);

        const epics = await EpicsService.getEpicsByProjectId(project._id);
        const storiesRequests = epics.map(epic => 
          UserStoriesService.getUserStoriesByEpicId(epic._id)
        );
        
        const allUserStories = (await Promise.all(storiesRequests)).flat();
        const totalStories = allUserStories.length;
        const completedStories = allUserStories.filter(
          story => story.status?.toLowerCase() === 'completado'
        ).length;

        setProgress(totalStories > 0 
          ? Math.round((completedStories / totalStories) * 100)
          : 0);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setManagerName('Usuario desconocido');
      }
    };

    fetchData();
  }, [project._id, project.authorUserId]);

  return (
    <div className={` 
      rounded-xl p-4 md:p-5 shadow-sm transition-all h-full
      ${theme === 'dark' ? 'bg-zinc-900 hover:bg-gray-900' : 'bg-white hover:bg-gray-50'}
    `}>
      <div className="flex justify-between items-start mb-2 md:mb-3">
        <h2 className={`text-lg md:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {project.name}
        </h2>
        <span className={`text-xs md:text-sm px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          {project.version}
        </span>
      </div>

      <p className={`text-xs md:text-sm mb-3 md:mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        {project.description}
      </p>

      <div className={`text-xs mb-3 md:mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
        <p>Fecha inicio: {formatUTCDate(project.startDate)}</p>
        <p>Fecha límite: {formatUTCDate(project.dueDate)}</p>
        <p>Encargado: {managerName}</p>
      </div>
      
      <span className={`text-xs mb-3 md:mb-4 ${theme === 'dark' ? 'text-green-500' : 'text-green-400'}`}>
        {project.status}
      </span>

      <div className="mb-3 md:mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Progreso</span>
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{progress}%</span>
        </div>
        <ProgressBar progress={progress} theme={theme} />
      </div>

      <ProjectActions 
        projectId={project._id ? project._id.toString() : ''} // Asegurar string
        theme={theme} 
        onArchive={onArchive} 
      />
    </div>
  );
};

export default ProjectCard;
