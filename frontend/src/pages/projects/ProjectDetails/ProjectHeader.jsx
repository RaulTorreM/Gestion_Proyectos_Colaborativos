import { useState, useEffect } from 'react';
import ProgressBar from '../../../components/projects/ProgressBar';
import UsersService from '../../../api/services/usersService';

const ProjectHeader = ({
  project = {},
  theme = 'light',
  isEditing = false,
  editedProject = {},
  onInputChange = () => {},
}) => {
  const safeProject = {
    epics: {
      completed: 0,
      total: 0,
      ...project.epics
    },
    members: project.members || [],
    rawStartDate: null,
    formattedStartDate: '',
    formattedEndDate: '',
    description: '',
    startDate: project.startDate || null,
    dueDate: project.dueDate || null,
    ...project
  };

  const [managerName, setManagerName] = useState('Cargando...');
  const [loadingError, setLoadingError] = useState(null);
  const [membersInfo, setMembersInfo] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'No definida';
      const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
      return date.toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'No definida';
    }
  };

  const calculateDuration = () => {
    try {
      const currentStartDate = editedProject.startDate || safeProject.startDate;
      const currentDueDate = editedProject.dueDate || safeProject.dueDate;

      const startDate = currentStartDate ? new Date(currentStartDate) : null;
      const dueDate = currentDueDate ? new Date(currentDueDate) : null;

      if (!startDate || isNaN(startDate.getTime()) || !dueDate || isNaN(dueDate.getTime())) {
        return 'No definida';
      }

      const timeDiff = dueDate.getTime() - startDate.getTime();
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (dayDiff < 0) return 'Fechas inválidas';
      return `${dayDiff} días`;
    } catch (error) {
      console.error('Error calculando duración:', error);
      return 'No definida';
    }
  };

  useEffect(() => {
    const fetchManagerAndMembers = async () => {
      try {
        setLoadingError(null);
        if (safeProject.authorUserId) {
          const manager = await UsersService.getUserById(safeProject.authorUserId);
          setManagerName(manager.name || 'Encargado');
        } else {
          setManagerName('Encargado no asignado');
        }

        if (safeProject.members && safeProject.members.length > 0) {
          const membersData = await Promise.all(
            safeProject.members.map(async (member) => {
              if (!member.userId) {
                return { ...member, name: 'Usuario desconocido', avatar: '', role: member.role || 'Miembro' };
              }
              const user = await UsersService.getUserById(member.userId);
              return {
                ...member,
                name: user.name || 'Nombre no disponible',
                avatar: user.avatar,
                role: member.role
              };
            })
          );
          setMembersInfo(membersData);
        } else {
          setMembersInfo([]);
        }
      } catch (error) {
        console.error('Error cargando información del equipo:', error);
        setManagerName('Encargado no disponible');
        setMembersInfo([]);
        setLoadingError('Error cargando información del equipo');
      }
    };

    fetchManagerAndMembers();
  }, [safeProject.authorUserId, safeProject.members]);

  const duration = calculateDuration();
  const progressPercentage = safeProject.epics.total > 0 
    ? Math.round((safeProject.epics.completed / safeProject.epics.total) * 100) 
    : 0;

  const handleDueDateChange = (e) => {
    const newDueDate = e.target.value;
    const projectStartDate = editedProject.startDate || safeProject.startDate;
    if (projectStartDate && new Date(newDueDate) < new Date(projectStartDate)) {
      alert('La fecha límite no puede ser anterior a la fecha de inicio');
      return;
    }
    onInputChange({
      target: {
        name: 'dueDate',
        value: newDueDate
      }
    });
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  };
  
  const displayStartDate = formatDate(isEditing ? (editedProject.startDate || safeProject.startDate) : safeProject.startDate);
  const displayDueDate = formatDate(editedProject.dueDate || safeProject.dueDate);
  const dueDateValueForInput = editedProject.dueDate || safeProject.dueDate || '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Tarjeta 1: Progreso */}
      <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
        <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Progreso
        </h3>
        <div className="flex justify-between items-center mb-1">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {safeProject.epics.completed}/{safeProject.epics.total} épicas
          </span>
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {progressPercentage}%
          </span>
        </div>
        <ProgressBar progress={progressPercentage} theme={theme} />
      </div>

      {/* Tarjeta 2: Fechas */}
      <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
        <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Fechas
        </h3>
        {isEditing ? (
          <div className="space-y-2">
            <div> {/* Fecha de inicio */}
              <label className={`block text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                Fecha de inicio
              </label>
              <input
                type="text" 
                readOnly 
                value={displayStartDate} 
                className={`w-full p-1 rounded text-sm ${
                  theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                } cursor-not-allowed`}
              />
            </div>
            <div> {/* Fecha límite */}
              <label className={`block text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                Fecha límite
              </label>
              <input
                type="date"
                name="dueDate"
                value={dueDateValueForInput} 
                onChange={handleDueDateChange}
                className={`w-full p-1 rounded text-sm ${
                  theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border'
                }`}
              />
            </div>
              <div> {/* Fecha de fin */}
                <label className={`block text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  Fecha de fin
                </label>
                <input
                  type="text"
                  readOnly
                  value="No definida"
                  className={`w-full p-1 rounded text-sm ${
                    theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                  } cursor-not-allowed`}
                />
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  Se asignará automáticamente al finalizar
                </p>
              </div>
            <div> {/* Duración */}
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                Duración (inicio - límite)
              </p>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}>
                {duration}
              </p>
            </div>
          </div>
        ) : ( /* Modo visualización de Fechas */
          <div className="space-y-2">
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Inicio</p>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}>
                {formatDate(safeProject.startDate)}
              </p>
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Fecha límite</p>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}>
                {displayDueDate} 
              </p>
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Fin</p>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}>
                No definida
              </p>
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Duración</p>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}>
                {duration}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tarjeta 3: Equipo */}
      <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
        <div className="flex justify-between items-start mb-3">
          <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Equipo ({ (safeProject.members ? safeProject.members.length : 0) + (safeProject.authorUserId ? 1 : 0) })
          </h3>
        </div>

        {loadingError && (
          <div className={`text-xs mb-2 p-1 rounded ${
            theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
          }`}>
            {loadingError}
          </div>
        )}

        <div className="space-y-3">
          {safeProject.authorUserId && (
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full mr-3 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              } flex items-center justify-center ring-2 ring-blue-500`}>
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {getInitials(managerName)}
                </span>
              </div>
              <div>
                <p className={`flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                  {managerName}
                  <span className={`ml-2 text-xs px-1 py-0.5 rounded ${
                    theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                  }`}>
                    Encargado
                  </span>
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  Responsable del proyecto
                </p>
              </div>
            </div>
          )}
          
          {membersInfo.map((member) => (
            <div key={member.userId || member.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full mr-3 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                } flex items-center justify-center`}>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {getInitials(member.name)}
                  </span>
                </div>
                <div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {member.name}
                  </p>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {member.role || 'Miembro'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tarjeta 4: Descripción */}
      <div className={`rounded-xl p-4 shadow-sm ${
        theme === 'dark' ? 'bg-zinc-900' : 'bg-white'
      }`}>
        <h3 className={`font-medium mb-3 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Descripción
        </h3>
        {isEditing ? (
            <textarea
              name="description"
              value={editedProject.description !== undefined ? editedProject.description : (safeProject.description || '')}
              onChange={onInputChange}
              className={`w-full p-2 rounded text-sm ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border'}`}
              rows="4"
              placeholder="Describe el proyecto..."
            />
          ) : (
            <p className={`text-sm min-h-[calc(1.5em*4+1rem)] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {safeProject.description || 'No hay descripción disponible'}
            </p>
          )}
      </div>
    </div>
  );
};
export default ProjectHeader;