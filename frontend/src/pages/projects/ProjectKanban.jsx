import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useState, useEffect, useMemo} from 'react';
import EpicDetail from './ProjectKanban/EpicDetail';
import AddEpicModal from './ProjectKanban/AddEpicModal';
import KanbanColumn from './ProjectKanban/KanbanColumn';
import ProjectsService from '../../api/services/projectsService';
import EpicsService from '../../api/services/epicsService';
import AuthService from '../../api/services/authService';
import PrioritiesService from '../../api/services/prioritiesService';
import UserStoriesService from '../../api/services/userStoriesService';
import { toast } from 'react-toastify';

const ProjectKanban = () => {
  const [loggedUser, setLoggedUser] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [rawEpics, setRawEpics] = useState([]);

  const epics = Array.isArray(rawEpics)
    ? rawEpics.filter(e => e && typeof e._id === 'string')
    : [];

  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedEpic, setselectedEpic] = useState(null);
  const [showAddEpicModal, setShowAddEpicModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const safeEpics = Array.isArray(epics)
  ? epics.filter(e => e && typeof e._id === 'string')
  : [];

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [loggedUserRes, prioritiesRes, projectRes, epicsData] = await Promise.all([
        AuthService.getLoggedUser(),
        PrioritiesService.getNoMoscowPriorities(),
        ProjectsService.getProjectById(projectId),
        EpicsService.getEpicsByProjectId(projectId) // Obtenemos epics con sus HUs ya incluidas
      ]);

      if (!loggedUserRes) throw new Error('No se pudo obtener el usuario logeado');
      if (!prioritiesRes) throw new Error('Error al obtener prioridades');
      if (!projectRes) throw new Error('Proyecto no encontrado');
      if (!epicsData) throw new Error('Error al obtener épicas');

      
      // Obtener HU para cada épica
      const epicsWithStories = await Promise.all(epicsData.map(async epic => {
        const stories = await UserStoriesService.getUserStoriesByEpic(epic._id);
        return { ...epic, userStories: stories };
      }));

      setLoggedUser(loggedUserRes);
      setPriorities(prioritiesRes);
      setProject(projectRes);
      setRawEpics(epicsData);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar datos');
      toast.error(err.message || 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData() }, [projectId]);

  const columns = useMemo(() => {
    const cols = {
      pending:    { id: 'pending',    title: 'Pendiente',    epics: [] },
      inProgress: { id: 'inProgress', title: 'En progreso', epics: [] },
      completed:  { id: 'completed',  title: 'Completado', epics: [] }
    };

    epics.forEach(epic => {
      const status = (epic.status || '').toLowerCase();
      const columnId = status.includes('completado')
        ? 'completed'
        : status.includes('progreso')
          ? 'inProgress'
          : 'pending';
  
      cols[columnId].epics.push({
        ...epic,
        id: epic._id,
        title: epic.name,
        userStories: epic.userStories || []
      });
    });

    return cols;
    }, [epics]);


  const openEpicDetail = (epic) => setselectedEpic(epic);
  const closeEpicDetail = () => setselectedEpic(null);

  const handleUpdateEpic = async (updatedEpic) => {
    try {
      const payload = {
        name:        updatedEpic.name,
        description: updatedEpic.description,
        startDate:   updatedEpic.startDate,
        dueDate:     updatedEpic.dueDate,
        priorityId:  updatedEpic.priorityId,
        status:      updatedEpic.status,
        userStories: updatedEpic.userStories.map(us => us._id),
      };
      await EpicsService.updateEpic(updatedEpic._id, payload);
      

      await loadData();
      // si además tienes el modal de detalle abierto, ciérralo
      setselectedEpic(null);
      return true;
      
    } catch (error) {
      console.error('Error al actualizar:', error.response?.data || error);
      toast.error('Error al actualizar la épica');
      return false;
    }
  };

  const formatDateForInput = (dateString) => {
    const d = new Date(dateString);
    return d.toISOString().split('T')[0]; 
  };
  

  const handleUpdateEpicUserStories = (epicId, userStories) => {
    setRawEpics(prev => prev.map(epic => 
      epic._id === epicId ? { ...epic, userStories } : epic
    ));
  };

  const handleDeleteEpic = async (epicId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta épica?')) return;
    
    try {
      await EpicsService.deleteEpic(epicId);
      setRawEpics(prev => prev.filter(e => e._id !== epicId));
      closeEpicDetail();
      toast.success('Épica eliminada correctamente');
      await loadData();
    } catch (error) {
      console.error('Error al eliminar épica:', error);
      toast.error('Error al eliminar la épica');
    }
  };

  const handleDrop = async (e, targetColumnId) => {
    const taskId = e.dataTransfer.getData("taskId");
    const sourceColumnId = e.dataTransfer.getData("sourceColumnId");
    
    if (sourceColumnId === targetColumnId) return;

    const newStatus = 
      targetColumnId === 'completed' ? 'Completado' :
      targetColumnId === 'inProgress' ? 'En Progreso' : 'Pendiente';

    try {
      await EpicsService.updateEpic(taskId, { status: newStatus });
      setRawEpics(prev => prev.map(epic => 
        epic._id === taskId ? { ...epic, status: newStatus } : epic
      ));
    } catch (error) {
      console.error('Error al mover épica:', error);
      toast.error('Error al mover la épica');
    }
  };

  const handleAddEpic = async (newEpic) => {
    try {
      // Solo pasar los campos necesarios al backend
      const savedEpic = await EpicsService.createEpic({
        name: newEpic.name,
        description: newEpic.description,
        startDate: newEpic.startDate,
        dueDate: newEpic.dueDate,
        priorityId: newEpic.priorityId, // Solo el ID
        projectId: project._id,
        status: 'Pendiente'
      });
      
      toast.success('Épica creada correctamente');
      setShowAddEpicModal(false);
      await loadData();

    } catch (error) {
      console.error('Error detallado:', error);
      toast.error(error.response?.data?.message || 'Error al crear la épica');
    }
  };

  const updateEpicUserStories = (epicId, userStories) => {
    setEpics(prev => prev.map(epic => 
      epic._id === epicId ? { ...epic, userStories } : epic
    ));
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
            projectDueDate={formatDateForInput(project.dueDate)}
            projectStartDate={formatDateForInput(project.startDate)}
          />
        </div>
      )}

      {selectedEpic && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <EpicDetail 
            epic={selectedEpic}
            onClose={closeEpicDetail}
            onSave={handleUpdateEpic}  
            onDelete={handleDeleteEpic} 
            theme={theme}
            priorities={priorities}
            onUpdateUserStories={(stories) => 
              handleUpdateEpicUserStories(selectedEpic._id, stories)
            }
          />
        </div>
      )}
    </div>
  );
};

export default ProjectKanban;