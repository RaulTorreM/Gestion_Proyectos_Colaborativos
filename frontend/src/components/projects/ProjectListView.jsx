import DropdownMenu from '../common/DropdownMenu';
import AvatarGroup from '../common/AvatarGroup';

const ProjectListView = ({ project }) => {
  const progressPercentage = project.totalTasks > 0 
    ? Math.round((project.completedTasks / project.totalTasks) * 100)
    : 0;

  const getProgressColor = (percentage) => {
    if (percentage < 40) return 'bg-red-600';
    if (percentage < 92) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  return (
    <tr className="hover:bg-gray-900 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-bold text-white">{project.name}</div>
            <div className="text-sm text-gray-400">{project.description}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full 
          ${project.status === 'active' ? 'bg-green-900 text-green-300 border border-green-600' : 
            'bg-gray-900 text-gray-400 border border-gray-700'}`}>
          {project.status === 'active' ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-32 mr-2">
            <div className="w-full bg-gray-900 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(progressPercentage)}`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <span className="text-sm font-bold text-white">{progressPercentage}%</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
        {new Date(project.endDate).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <AvatarGroup users={project.members} limit={5} size="sm" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end">
          <div className="relative z-50">
            <DropdownMenu items={[
              { 
                label: 'Ver Detalles', 
                action: () => console.log('Ver detalles:', project._id),
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
      </td>
    </tr>
  );
};

// Iconos con color gris para mejor contraste
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

export default ProjectListView;