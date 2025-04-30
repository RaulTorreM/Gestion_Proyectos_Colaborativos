// src/pages/projects/ProjectDetails/ProjectHeader.jsx
import ProgressBar from '../../../components/projects/ProgressBar';

const ProjectHeader = ({ project = {}, theme = 'light' }) => {
  // Valores por defecto para evitar errores
  const safeProject = {
    tasks: {
      completed: 0,
      total: 0,
      ...project.tasks
    },
    members: [],
    startDate: '',
    endDate: '',
    description: '',
    ...project
  };

  // Calcular duración del proyecto de forma segura
  const start = safeProject.startDate ? new Date(safeProject.startDate) : new Date();
  const end = safeProject.endDate ? new Date(safeProject.endDate) : new Date();
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  // Calcular progreso de forma segura
  const progressPercentage = safeProject.tasks.total > 0 
    ? Math.round((safeProject.tasks.completed / safeProject.tasks.total) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Tarjeta 1: Progreso */}
      <div className={`
        rounded-xl p-4 shadow-sm
        ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}
      `}>
        <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Progreso
        </h3>
        <div className="flex justify-between items-center mb-1">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {safeProject.tasks.completed}/{safeProject.tasks.total} tareas
          </span>
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {progressPercentage}%
          </span>
        </div>
        <ProgressBar 
          progress={progressPercentage} 
          theme={theme} 
        />
      </div>

      {/* Tarjeta 2: Fechas */}
      <div className={`
        rounded-xl p-4 shadow-sm
        ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}
      `}>
        <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Fechas
        </h3>
        <div className="space-y-2">
          <div>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Inicio</p>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}>
              {safeProject.startDate || 'No definida'}
            </p>
          </div>
          <div>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Fin</p>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}>
              {safeProject.endDate || 'No definida'}
            </p>
          </div>
          <div>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Duración</p>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}>{duration} días</p>
          </div>
        </div>
      </div>

      {/* Tarjeta 3: Equipo */}
      <div className={`
        rounded-xl p-4 shadow-sm
        ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}
      `}>
        <div className="flex justify-between items-start mb-3">
          <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Equipo ({safeProject.members.length})
          </h3>
          <button className={`
            text-xs px-2 py-1 rounded
            ${theme === 'dark' ? 
              'bg-gray-700 hover:bg-gray-600 text-blue-400' : 
              'bg-gray-100 hover:bg-gray-200 text-blue-600'}
          `}>
            + Añadir
          </button>
        </div>
        <div className="space-y-3">
          {safeProject.members.slice(0, 3).map(member => (
            <div key={member.userId} className="flex items-center">
              <div className={`w-8 h-8 rounded-full mr-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {member.name?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}>
                  {member.name || 'Miembro sin nombre'}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {member.role || 'Sin rol definido'}
                </p>
              </div>
            </div>
          ))}
          {safeProject.members.length > 3 && (
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              +{safeProject.members.length - 3} miembros más
            </p>
          )}
        </div>
      </div>

      {/* Tarjeta 4: Descripción */}
      <div className={`
        rounded-xl p-4 shadow-sm
        ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}
      `}>
        <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Descripción
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {safeProject.description || 'No hay descripción disponible'}
        </p>
      </div>
    </div>
  );
};

export default ProjectHeader;