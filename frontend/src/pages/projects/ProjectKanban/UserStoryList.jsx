// UserStoryList.jsx
import { useState } from 'react';
import UserStoryManualForm from './UserStoryManualForm';
import UserStoryBulkForm from './UserStoryBulkForm';
import UserStoriesService from '../../../api/services/userStoriesService';
import { toast } from 'react-toastify';


const UserStoryList = ({ userStories = [], epicToEdit, editing, onUpdate, onSavedOneStory, theme, epicId, priorities = [] }) => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [storyToEdit, setStoryToEdit] = useState(null);
  const [showBulkForm, setShowBulkForm] = useState(false);

  const handleAddStory = () => {
    setStoryToEdit(null);
    setShowManualForm(true);
  };
  const handleEditStory = (story) => {
    setStoryToEdit(story);
    setShowManualForm(true);
  };

  // Antes:
// const handleManualSave = (payload, isEditing) => { ... }

// Después:
const handleManualSave = async (payload, isEditing) => {
    try {
      console.log('handleManualSave payload:', payload, 'isEditing:', isEditing);
      let updatedStories;
      if (isEditing) {
        const updatedStory = await UserStoriesService.updateUserStory(payload._id, payload);
        console.log('API returned updatedStory:', updatedStory);
        updatedStories = userStories.map(us =>
          us._id === updatedStory._id ? updatedStory : us
        );
      } else {
        const createdStory = await UserStoriesService.createUserStory(payload);
        console.log('API returned createdStory:', createdStory);
        updatedStories = [...userStories, createdStory];
      }
      // Actualizar la lista en el padre
      onUpdate(updatedStories);

      // Intentar refrescar la épica completa si se pasó callback
      if (typeof onSavedOneStory === 'function') {
        console.log('Invocando onSavedOneStory para recargar épica');
        await onSavedOneStory();
      } else {
        console.log('No hay onSavedOneStory, no se recarga épica');
      }

      // Finalmente, cerrar el form
      setShowManualForm(false);
      setStoryToEdit(null);
    } catch (error) {
      console.error('Error guardando historia:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la historia');
      // NO cerramos el form para que el usuario corrija
    }
  };



  const handleBulkSave = (storiesArray) => {
    // storiesArray: cada item sin _id
    const newStories = storiesArray.map(hu => {
      const tempId = `us-${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
      return { ...hu, _id: tempId };
    });
    const updatedStories = [...userStories, ...newStories];
    onUpdate(updatedStories);
    setShowBulkForm(false);
  };

  const handleDeleteStory = (story) => {
    const updatedStories = userStories.filter(us => us._id !== story._id);
    onUpdate(updatedStories);
    // Si story._id real, llamar API delete
    if (!story._id.startsWith('us-')) {
      import('../../../api/services/userStoriesService').then(mod => {
        mod.default.deleteUserStory(story._id).catch(err => {
          console.error('Error eliminando HU:', err);
        });
      });
    }
  };

  const getPriorityName = (story) => {
    const id = typeof story.priorityId === 'object' ? story.priorityId._id : story.priorityId;
    const p = priorities.find(pr => pr._id === id);
    return p?.name;
  };
  
  const getPriorityColor = (story) => {
    const name = getPriorityName(story) || story.priorityName;
    if (!name) return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    switch (name) {
      case 'Debe tener': return theme === 'dark' ? 'bg-red-700 text-red-0' : 'bg-red-100 text-red-800';
      case 'Debería incluir': return theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'Podría incluir': return theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      case 'No se va a hacer': return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
      default: return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
    
  };

  

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Historias de Usuario ({userStories.length})
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
          onSaveBulk={handleBulkSave}
        />
      )}

      {!showManualForm && !showBulkForm && (
        <>
          {userStories.length === 0 ? (
            <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              No hay historias de usuario registradas
            </p>
          ) : (
            <div className={`rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'}`}>
              <ul className="divide-y">
                {userStories.map((story, idx) => (
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
