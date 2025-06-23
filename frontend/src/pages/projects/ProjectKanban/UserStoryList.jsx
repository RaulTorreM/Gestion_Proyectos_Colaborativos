import { useState } from 'react';
import UserStoryForm from './UserStoryForm';
import UserStoriesService from '../../../api/services/userStoriesService';
import { toast } from 'react-toastify';

const UserStoryList = ({ userStories = [], epicToEdit, editing, onUpdate, theme, epicId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [isCreating, setIsCreating] = useState(false); // Nuevo estado para diferenciar creación
  const [isSaving, setIsSaving] = useState(false);

  const handleAddStory = () => {
    setEditingStory(null);
    setIsCreating(true); // Indicar que estamos creando
    setShowForm(true);
  };

  const handleEditStory = (story) => {
    setEditingStory(story);
    setIsCreating(false); // Indicar que estamos editando
    setShowForm(true);
  };

  const handleSaveStory = async (storyData) => {
    try {
      let savedStory;
      const payload = {
        name: storyData.name,
        description: storyData.description,
        priorityId: storyData.priorityId, // Asegurar que se envía
        status: storyData.status,
        assignedTo: storyData.assignedTo || [],
        // Mantener epicId para nuevas historias
        ...(isCreating && { epicId }) 
      };

      if (isCreating) {
        // Crear nueva historia
        savedStory = await UserStoriesService.createUserStory(payload);
      } else {
        // Actualizar existente
        savedStory = await UserStoriesService.updateUserStory(
          storyData._id, 
          payload
        );
      }

      // Actualizar lista local
      const updatedStories = isCreating
      ? [...userStories, {...savedStory, isModified: true}]
      : userStories.map(us => 
          us._id === savedStory._id 
            ? {...savedStory, isModified: true} 
            : us
        );

      onUpdate(updatedStories);
      setShowForm(false);
      setIsCreating(false);
      
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error('Error al guardar la historia');
    }
  };

  const handleDeleteStory = async (storyId) => {
    try {
      await UserStoriesService.deleteUserStory(storyId);
      const updatedStories = userStories.filter(us => us._id !== storyId);
      onUpdate(updatedStories);
      
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Error al eliminar la historia');
    }
  };

  // Modificada para usar priorityId.name
  const getPriorityColor = (priorityName) => {
    if (!priorityName) return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    
    switch (priorityName) {
      case 'Must': return theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'Should': return theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'Could': return theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800';
      case 'Wont': return theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
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
          <button
            onClick={handleAddStory}
            className={`px-3 py-1 text-sm rounded-lg flex items-center gap-1 ${theme === 'dark' ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-green-100 hover:bg-green-200 text-green-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Modificar
          </button>
        )}
      </div>

      {showForm ? (
        <UserStoryForm 
          story={editingStory} 
          epicId={epicId} 
          epicToEdit={epicToEdit}
          onSave={handleSaveStory} 
          onCancel={() => {
            setShowForm(false);
            setIsCreating(false);
          }}
          theme={theme}
        />
      ) : (
        <>
          {userStories.length === 0 ? (
            <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              No hay historias de usuario registradas
            </p>
          ) : (
            <div className={`rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'}`}>
              <ul className="divide-y">
                {userStories.map((story, index) => (
                  <li 
                    key={story._id || `story-${index}`}
                    className={`p-4 ${theme === 'dark' ? 'divide-zinc-700 hover:bg-zinc-700' : 'divide-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          {story.name || 'Historia sin nombre'}
                        </p>
                        {story.description && (
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {story.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {/* Mostrar nombre de la prioridad */}
                          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(story.priorityId?.name)}`}>
                            {/* {console.log(story)} */}
                            {story.priorityId?.name || 'Sin prioridad'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-zinc-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                            {story.status || 'Pendiente'}
                          </span>
                        </div>
                      </div>

                      {editing && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditStory(story)}
                            className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-zinc-700 text-blue-400' : 'hover:bg-gray-200 text-blue-600'}`}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteStory(story._id)}
                            className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-zinc-700 text-red-400' : 'hover:bg-gray-200 text-red-600'}`}
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