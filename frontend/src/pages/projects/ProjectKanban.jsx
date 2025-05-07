import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect } from 'react';
import TaskDetail from './ProjectKanban/TaskDetail';
import AddTaskModal from './ProjectKanban/AddTaskModal';
import KanbanColumn from './ProjectKanban/KanbanColumn';
import ProjectsService from '../../api/services/projectsService';
import EpicsService from '../../api/services/epicsService';
import AuthService from '../../api/services/authService';

const ProjectKanban = () => {
  const [loggedUser, setLoggedUser] = useState(null);
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [epics, setEpics] = useState([]);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [columns, setColumns] = useState({
    todo: { id: 'todo', title: 'Pendiente', epics: [] },
    inProgress: { id: 'inProgress', title: 'En progreso', epics: [] },
    completed: { id: 'completed', title: 'Completado', epics: [] }
  });

  const [priorities] = useState([
    { _id: '1', name: 'Alta', color: 'red' },
    { _id: '2', name: 'Media', color: 'yellow' },
    { _id: '3', name: 'Baja', color: 'green' }
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const loggedUser = await AuthService.getLoggedUser();
        if (!loggedUser) {
          throw new Error('No se pudo obtener el usuario logeado');
        }
        
        setLoggedUser(loggedUser);

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
          todo: { id: 'todo', title: 'Pendiente', epics: [] },
          inProgress: { id: 'inProgress', title: 'En progreso', epics: [] },
          completed: { id: 'completed', title: 'Completado', epics: [] }
        };
        
        epicsData.forEach(epic => {
          const columnId = 
            epic.status === 'Completado' ? 'completed' :
            epic.status === 'En Progreso' ? 'inProgress' : 'todo';
            
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

  const openTaskDetail = (task) => setSelectedTask(task);
  const closeTaskDetail = () => setSelectedTask(null);

  const updateTask = async (updatedTask) => {
    try {
      const savedTask = { 
        ...updatedTask,
        _id: updatedTask.id,
        name: updatedTask.title,
        updatedAt: new Date().toISOString()
      };

      const updatedColumns = { ...columns };
      Object.keys(updatedColumns).forEach(columnId => {
        updatedColumns[columnId].epics = updatedColumns[columnId].epics.map(task => 
          task.id === savedTask._id ? { 
            ...savedTask,
            id: savedTask._id,
            title: savedTask.name
          } : task
        );
      });
      setColumns(updatedColumns);
      closeTaskDetail();
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
      const taskToMove = prevColumns[sourceColumnId].epics.find(task => task.id === taskId);
      if (!taskToMove) return prevColumns;

      return {
        ...prevColumns,
        [sourceColumnId]: {
          ...prevColumns[sourceColumnId],
          epics: prevColumns[sourceColumnId].epics.filter(task => task.id !== taskId)
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

  const handleAddTask = async (newTask) => {
    try {
      const priorityObj = priorities.find(p => p._id === newTask.priority) || { 
        _id: newTask.priority, 
        name: newTask.priority, 
        color: 'gray' 
      };

      const savedTask = {
        ...newTask,
        _id: Date.now().toString(),
        projectId,
        priority: priorityObj,
        userStories: [],
        authorUserId: 'usr-12345',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Determinar la columna destino basada en el estado
      const targetColumn = 
        newTask.status === 'Completado' ? 'completed' :
        newTask.status === 'En Progreso' ? 'inProgress' : 'todo';

      setColumns(prevColumns => ({
        ...prevColumns,
        [targetColumn]: {
          ...prevColumns[targetColumn],
          epics: [...prevColumns[targetColumn].epics, { 
            ...savedTask,
            id: savedTask._id,
            title: savedTask.name
          }]
        }
      }));
      
      setShowAddTaskModal(false);
    } catch (error) {
      console.error('Error al crear épica:', error);
    }
  };

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
            className={`mt-4 px-4 py-2 rounded-lg 
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
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
            ${theme === 'dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver a Proyectos
        </button>
        
        <button
          onClick={() => setShowAddTaskModal(true)}
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
              onClickTask={openTaskDetail}
              loggedUser={loggedUser}
            />
          ))}
        </div>
      </div>

      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <AddTaskModal
            onClose={() => setShowAddTaskModal(false)}
            onSave={handleAddTask}
            theme={theme}
            priorities={priorities}
            projectId={projectId}
          />
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <TaskDetail 
            task={selectedTask}
            onClose={closeTaskDetail}
            onSave={updateTask}
            theme={theme}
            priorities={priorities}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectKanban;
