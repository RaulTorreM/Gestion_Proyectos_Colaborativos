import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect } from 'react';
import EpicDetail from './ProjectKanban/EpicDetail';
import AddEpicModal from './ProjectKanban/AddEpicModal';
import KanbanColumn from './ProjectKanban/KanbanColumn';
import ProjectsService from '../../api/services/projectsService';
import EpicsService from '../../api/services/epicsService';
import AuthService from '../../api/services/authService';
import PrioritiesService from '../../api/services/prioritiesService';

const ProjectKanban = () => {
  const [loggedUser, setLoggedUser] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [epics, setEpics] = useState([]);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedEpic, setselectedEpic] = useState(null);
  const [showAddEpicModal, setShowAddEpicModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [columns, setColumns] = useState({
    pending: { id: 'pending', title: 'Pendiente', epics: [] },
    inProgress: { id: 'inProgress', title: 'En progreso', epics: [] },
    completed: { id: 'completed', title: 'Completado', epics: [] }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Cargar el usuario logeado
        const loggedUser = await AuthService.getLoggedUser();
        if (!loggedUser) {
          throw new Error('No se pudo obtener el usuario logeado');
        }
        
        setLoggedUser(loggedUser);

        // Cargar las prioridades no moscow
        const prioritiesData = await PrioritiesService.getNoMoscowPriorities();

        if (!prioritiesData) {
          throw new Error('No se pudo obtener las prioridades de épicas');
        }
          
        setPriorities(prioritiesData);

        // Cargar datos del proyecto
        const projectData = await ProjectsService.getProjectById(projectId);
        if (!projectData) {
          throw new Error('No se pudo cargar el proyecto');
        }
        
        setProject(projectData);
        
        // Cargar épicas asociadas al proyecto
        let epicsData = [];
        if (projectData.epics && projectData.epics.length > 0) {
          epicsData = await EpicsService.getEpicsByIds(projectData.epics);
        }
        
        setEpics(epicsData);
        
        // Organizar épicas en columnas según su estado
        const updatedColumns = {
          pending: { id: 'pending', title: 'Pendiente', epics: [] },
          inProgress: { id: 'inProgress', title: 'En progreso', epics: [] },
          completed: { id: 'completed', title: 'Completado', epics: [] }
        };
        
        epicsData.forEach(epic => {
          const columnId = 
            epic.status === 'Completado' ? 'completed' :
            epic.status === 'En Progreso' ? 'inProgress' : 'pending';
            
          updatedColumns[columnId].epics.push({
            ...epic,
            id: epic._id,
            title: epic.name
          });
        });
        
        setColumns(updatedColumns);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const openEpicDetail = (epic) => setselectedEpic(epic);
  const closeEpicDetail = () => setselectedEpic(null);

  const updateEpic = async (updatedEpic) => {
    try {
      const savedEpic = { 
        ...updatedEpic,
        _id: updatedEpic.id,
        name: updatedEpic.title,
        updatedAt: new Date().toISOString()
      };

      const updatedColumns = { ...columns };
      Object.keys(updatedColumns).forEach(columnId => {
        updatedColumns[columnId].epics = updatedColumns[columnId].epics.map(epic => 
          epic.id === savedEpic._id ? { 
            ...savedEpic,
            id: savedEpic._id,
            title: savedEpic.name
          } : epic
        );
      });
      setColumns(updatedColumns);
      closeEpicDetail();
    } catch (error) {
      console.error('Error al actualizar épica:', error);
    }
  };

  const handleDrop = (e, targetColumnId) => {
    const taskId = e.dataTransfer.getData("taskId");
    const sourceColumnId = e.dataTransfer.getData("sourceColumnId");
    
    if (sourceColumnId === targetColumnId) return;

    const newStatus = 
      targetColumnId === 'completed' ? 'Completado' :
      targetColumnId === 'inProgress' ? 'En Progreso' : 'Pendiente';

    setColumns(prevColumns => {
      const taskToMove = prevColumns[sourceColumnId].epics.find(epic => epic.id === taskId);
      if (!taskToMove) return prevColumns;

      return {
        ...prevColumns,
        [sourceColumnId]: {
          ...prevColumns[sourceColumnId],
          epics: prevColumns[sourceColumnId].epics.filter(epic => epic.id !== taskId)
        },
        [targetColumnId]: {
          ...prevColumns[targetColumnId],
          epics: [...prevColumns[targetColumnId].epics, {
            ...taskToMove,
            status: newStatus
          }]
        }
      };
    });
  };

  const handleAddEpic = async (newEpic) => {
    try {
      // Buscar el objeto de prioridad completo usando el priorityId
      const priorityObj = priorities.find(p => p._id === newEpic.priorityId) || { 
        _id: newEpic.priorityId, 
        name: 'Sin prioridad', // valor por defecto si no se encuentra el objeto
        color: 'gray' // valor por defecto si no se encuentra el objeto
      };

      // Crear un ID temporal para la nueva épica hasta que se confirme desde el backend
      const tempId = `temp-${Date.now()}`;
      
      // Prepare epic data for saving
      const epicToSave = {
        ...newEpic,
        projectId: project._id,
      };
      
      // Las nuevas épicas siempre van a la columna "pending"
      const targetColumn = 'pending';
      
      // Actualización instantánea antes de actualizar y obtener la data del backend
      setColumns(prevColumns => ({
        ...prevColumns,
        [targetColumn]: {
          ...prevColumns[targetColumn],
          epics: [...prevColumns[targetColumn].epics, { 
            ...epicToSave,
            id: tempId,         
            _id: tempId,        
            name: epicToSave.name,
            priorityName: priorityObj.name,
            priorityColor: priorityObj.color,
          }]
        }
      }));
      
      // Save epic to backend
      const savedEpic = await EpicsService.createEpic(epicToSave);
      
      if (savedEpic && savedEpic._id) {
        // Update column with the correct backend ID
        setColumns(prevColumns => {
          const updatedPendingEpics = prevColumns[targetColumn].epics.map(epic => 
            epic.id === tempId ? { 
              ...epic,
              id: savedEpic._id,
              _id: savedEpic._id
            } : epic
          );
          
          return {
            ...prevColumns,
            [targetColumn]: {
              ...prevColumns[targetColumn],
              epics: updatedPendingEpics
            }
          };
        });
      }
      
      setShowAddEpicModal(false);
    } catch (error) {
      console.error('Error al crear épica:', error);
      // Consider showing an error notification to the user here
    }
  }

  const handleDragStart = (e, taskId, sourceColumnId) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("sourceColumnId", sourceColumnId);
  };

  const handleDragOver = (e) => e.preventDefault();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-white text-red-600'}`}>
          <h3 className="font-bold text-xl mb-2">Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/projects')}
            className={`mt-4 px-4 py-2 rounded-lg cursor-pointer
              ${theme === 'dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Volver a Proyectos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => navigate('/projects')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer
            ${theme === 'dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Proyectos
        </button>
        
        <button
          onClick={() => setShowAddEpicModal(true)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
            ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Agregar Épica
        </button>
      </div>

      <div className={`rounded-xl p-5 shadow-sm transition-colors ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
        <h1 className={`text-2xl font-bold mb-6 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Tablero Kanban - Proyecto: {project?.name || projectId}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(columns).map(([columnId, column]) => (
            <KanbanColumn
              key={columnId}
              column={column}
              theme={theme}
              onDragStart={(e, epicId) => handleDragStart(e, epicId, columnId)}
              onDrop={(e) => handleDrop(e, columnId)}
              onDragOver={handleDragOver}
              onClickEpic={openEpicDetail}
              loggedUser={loggedUser}
            />
          ))}
        </div>
      </div>

      {showAddEpicModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <AddEpicModal
            onClose={() => setShowAddEpicModal(false)}
            onSave={handleAddEpic}
            theme={theme}
            priorities={priorities}
            projectId={projectId}
          />
        </div>
      )}

      {selectedEpic && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <EpicDetail 
            epic={selectedEpic}
            onClose={closeEpicDetail}
            onSave={updateEpic}
            theme={theme}
            priorities={priorities}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectKanban;