// src/components/projects/ProjectCard.jsx
import ProgressBar from './ProgressBar';
import ProjectActions from './ProjectActions';

const ProjectCard = ({ project, theme }) => {
  return (
    <div className={`
      rounded-xl p-4 md:p-5 shadow-sm transition-all h-full
      ${theme === 'dark' ? 'bg-zinc-900 hover:bg-gray-900' : 'bg-white hover:bg-gray-50'}
    `}>
      <div className="flex justify-between items-start mb-2 md:mb-3">
        <h2 className={`text-lg md:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {project.title}
        </h2>
        <span className={`text-xs md:text-sm px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          {project.version}
        </span>
      </div>

      <p className={`text-xs md:text-sm mb-3 md:mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        {project.description}
      </p>

      <div className={`text-xs mb-3 md:mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
        <p>Fecha inicio: {project.startDate}</p>
        <p>Fecha fin: {project.endDate}</p>
        <p>Encargado: {project.manager}</p>
      </div>

      <div className="mb-3 md:mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Progreso</span>
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{project.progress}%</span>
        </div>
        <ProgressBar progress={project.progress} theme={theme} />
      </div>

      <ProjectActions projectId={project.id} theme={theme} />
    </div>
  );
};

export default ProjectCard;