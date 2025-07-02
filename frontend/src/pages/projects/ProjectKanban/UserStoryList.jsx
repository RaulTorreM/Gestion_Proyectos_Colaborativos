// UserStoryList.jsx
import { useState, useEffect } from 'react';
import UserStoryManualForm from './UserStoryManualForm';
import UserStoryBulkForm from './UserStoryBulkForm';
import UserStoriesService from '../../../api/services/userStoriesService';
import PrioritiesService from '../../../api/services/prioritiesService';
import { toast } from 'react-toastify';


const UserStoryList = ({ userStories = [], epicToEdit, editing, onUpdate, onSavedOneStory, theme, epicId }) => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [storyToEdit, setStoryToEdit] = useState(null);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [moscowPriorities, setMoscowPriorities] = useState([]);
  // const [refreshKey, setRefreshKey] = useState(0);

  const [userStoriesList, setUserStoriesList] = useState(userStories);




  const handleAddStory = () => {
    setStoryToEdit(null);
    setShowManualForm(true);
  };
  const handleEditStory = (story) => {
    setStoryToEdit(story);
    setShowManualForm(true);
  };

  // useEffect(() => {
  //   const loadUserStories = async () => {
  //     if (epicId) {
  //       try {
  //         const updatedStories = await UserStoriesService.getUserStoriesByEpic(epicId);
  //         onUpdate(updatedStories);
  //       } catch (error) {
  //         console.error('Error cargando HUs:', error);
  //       }
  //     }
  //   };
    
  //   loadUserStories();
  // }, [refreshKey, epicId, onUpdate]);


  const handleManualSave = async (payload, isEditing) => {
    try {
      let savedStory = isEditing
        ? await UserStoriesService.updateUserStory(payload._id, payload)
        : await UserStoriesService.createUserStory(payload);
  
      // Construyo el nuevo array
      const updated = isEditing
        ? userStories.map(us => us._id === savedStory._id ? savedStory : us)
        : [...userStories, savedStory];


      onSavedOneStory?.(updated);


      // Cerrar el formulario
      setShowManualForm(false);
      setStoryToEdit(null);
  
      toast.success('Historia guardada correctamente');
  
    } catch (error) {
      console.error('Error guardando historia:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la historia');
    }
  };


  const handleSaveBulk = async (huArray) => {
    try {
      await UserStoriesService.createUserStoriesBulk(huArray);
      toast.success("Historias guardadas correctamente");
      // Recargar historias desde el backend
      await fetchUserStories(); // <-- importante volver a cargar
      setShowBulkForm(false); // <-- esto cierra el formulario
    } catch (error) {
      console.error("Error al guardar HUs:", error);
      toast.error("Error al guardar historias");
    }
  };

  const fetchUserStories = async () => {
    const data = await UserStoriesService.getUserStoriesByEpic(epicToEdit._id);
    setUserStoriesList(data);
  };
  
  useEffect(() => {
    setUserStoriesList(userStories);
  }, [userStories]);
  



  const handleDeleteStory = async (story) => {
    try {
      if (!story._id.startsWith('us-')) {
        await UserStoriesService.deleteUserStory(story._id);
      }
      await fetchUserStories(); 
      toast.success('Historia eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar historia:', error);
      toast.error('No se pudo eliminar la historia');
    }
  };
  
  


  // Cargar prioridades MOSCOW
  useEffect(() => {
    const loadPriorities = async () => {
      try {
        const prios = await PrioritiesService.getMoscowPriorities();
        setMoscowPriorities(prios || []);
      } catch (error) {
        console.error('Error cargando prioridades MOSCOW:', error);
        toast.error('Error cargando prioridades');
      }
    };
    loadPriorities();
  }, []);

  const getPriorityName = (story) => {
    if (!story.priorityId) return 'Sin prioridad';
    
    // Buscar en moscowPriorities
    const id = typeof story.priorityId === 'object' 
      ? story.priorityId._id 
      : story.priorityId;
    
    const p = moscowPriorities.find(pr => pr._id === id);
    return p?.name || 'Sin prioridad';
  };
  
  const getPriorityColor = (story) => {
    const name = getPriorityName(story);
    if (!name) return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    
    switch (name) {
      case 'Debe tener': 
        return theme === 'dark' ? 'bg-red-700 text-white' : 'bg-red-100 text-red-800';
      case 'Debería incluir': 
        return theme === 'dark' ? 'bg-yellow-700 text-white' : 'bg-yellow-100 text-yellow-800';
      case 'Podría incluir': 
        return theme === 'dark' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800';
      case 'No se va a hacer': 
        return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
      default: 
        return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Historias de Usuario ({userStoriesList.length})
        </h3>
        {editing && (
          <div className="flex gap-2">
            <button onClick={handleAddStory} className={`px-3 py-1 text-sm rounded-lg ${theme==='dark'? 'bg-green-700':'bg-green-100'}`}>
              Agregar HU
            </button>
            <button onClick={() => setShowBulkForm(true)} className={`px-3 py-1 text-sm rounded-lg ${theme==='dark'? 'bg-indigo-700':'bg-indigo-100'}`}>
              Generar HUs IA
            </button>
          </div>
        )}
      </div>

      {showManualForm && (
        <UserStoryManualForm
          story={storyToEdit}
          epicId={epicId}
          epicStartDate={epicToEdit.startDate}
          epicDueDate={epicToEdit.dueDate}
          theme={theme}
          onCancel={() => {
            setShowManualForm(false);
            setStoryToEdit(null);
          }}
          onSave={handleManualSave}
        />
      )}

      {showBulkForm && (
        <UserStoryBulkForm
          epicId={epicId}
          epicToEdit={epicToEdit}
          onCancel={() => setShowBulkForm(false)}
          theme={theme}
          onSaveBulk={handleSaveBulk}
          onUserStoriesUpdated={fetchUserStories}
        />
      )}

      {!showManualForm && !showBulkForm && (
        <>
          {userStoriesList.length === 0 ? (
            <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              No hay historias de usuario registradas
            </p>
          ) : (
            <div className={`rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'}`}>
              <ul className="divide-y">
                {userStoriesList.map((story, idx) => (
                  <li key={story._id || `us-${idx}`} className={`p-4 ${theme==='dark'?'divide-zinc-700':'divide-gray-200'}`}>
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <p className={`font-medium ${theme==='dark'?'text-white':'text-gray-800'}`}>
                          {story.name || 'Historia sin nombre'}
                        </p>
                        {story.description && (
                          <p className={`text-sm ${theme==='dark'?'text-gray-400':'text-gray-600'}`}>
                            {story.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(story)}`}>
                            {getPriorityName(story) || 'Sin prioridad'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${theme==='dark'?'bg-zinc-700 text-gray-300':'bg-gray-100 text-gray-700'}`}>
                            {story.status || 'Pendiente'}
                          </span>
                        </div>
                      </div>
                      {editing && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditStory(story)}
                            className={`p-1 rounded-full ${theme==='dark'?'hover:bg-zinc-700 text-blue-400':'hover:bg-gray-200 text-blue-600'}`}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteStory(story)}
                            className={`p-1 rounded-full ${theme==='dark'?'hover:bg-zinc-700 text-red-400':'hover:bg-gray-200 text-red-600'}`}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserStoryList;