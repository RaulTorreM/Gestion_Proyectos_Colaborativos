// src/components/projects/ProjectCard.jsx
import ProgressBar from './ProgressBar';
import ProjectActions from './ProjectActions';
import UsersService  from '../../api/services/usersService';
import EpicsService from '../../api/services/epicsService';
import UserStoriesService from '../../api/services/userStoriesService';
import { useState, useEffect } from 'react'; 


const ProjectCard = ({ project, theme }) => {
  const [managerName, setManagerName] = useState('Desconocido');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener nombre del manager
        const user = await UsersService.getUserById(project.authorUserId);
        setManagerName(user.name);

        // Obtener y validar épicas
        const epics = await EpicsService.getEpicsByProjectId(project._id);
        if (!Array.isArray(epics)) {
          throw new Error('Formato inválido de épicas');
        }

        // Obtener historias con manejo de errores individual
        const storiesRequests = epics.map(async (epic) => {
          try {
            const stories = await UserStoriesService.getUserStoriesByEpicId(epic._id);
            return stories;
          } catch (error) {
            console.error(`Error en épica ${epic._id}:`, error);
            return [];
          }
        });

        // Procesar todas las historias
        const allUserStories = (await Promise.all(storiesRequests))
          .flat()
          .filter(Boolean); // Eliminar posibles valores nulos

        // Calcular progreso con validación exhaustiva
        const totalStories = allUserStories.length;
        const completedStories = allUserStories.filter(
          story => story.status?.toLowerCase() === 'completado'
        ).length;

        const calculatedProgress = totalStories > 0 
          ? Math.round((completedStories / totalStories) * 100)
          : 0;


        setProgress(Math.min(calculatedProgress, 100)); // Asegurar máximo 100%

      } catch (error) {
        console.error('Error general:', error);
        setManagerName('Usuario desconocido');
        setProgress(0); // Forzar 0% en caso de error
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
        <p>Fecha inicio: {new Date(project.startDate).toLocaleDateString()}</p>
        <p>Fecha fin: {new Date(project.endDate).toLocaleDateString()}</p>
        <p>Encargado: {managerName}</p>
      </div>
      
      <span className={`text-xs mb-3 md:mb-4 ${theme === 'dark' ? 'text-green-500' : 'text-green-400'}`} >{project.status}</span>

      <div className="mb-3 md:mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Progreso</span>
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{progress}%</span>
        </div>
        <ProgressBar progress={progress} theme={theme} />
      </div>

      <ProjectActions projectId={project.id} theme={theme} />
    </div>
  );
};

export default ProjectCard;