import { useState } from 'react';
import UserStoryForm from './UserStoryForm';

const UserStoryList = ({ userStories = [], editing, onUpdate, theme }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  const handleAddStory = () => {
    setEditingStory(null);
    setShowForm(true);
  };

  const handleEditStory = (story) => {
    setEditingStory(story);
    setShowForm(true);
  };

  const handleSaveStory = (story) => {
    let updatedStories;
    
    if (story._id) {
      // Actualizar historia existente
      updatedStories = userStories.map(us => 
        us._id === story._id ? story : us
      );
    } else {
      // Crear nueva historia
      updatedStories = [...userStories, {
        ...story,
        _id: `us-${Date.now()}-${Math.random()}`, // aseguramos id único
        status: 'Pendiente',
        createdAt: new Date().toISOString()
      }];
    }

    onUpdate(updatedStories);
    setShowForm(false);
  };

  const handleDeleteStory = (storyId) => {
    const updatedStories = userStories.filter(us => us._id !== storyId);
    onUpdate(updatedStories);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
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
            Agregar
          </button>
        )}
      </div>

      {showForm ? (
        <UserStoryForm 
          story={editingStory} 
          onSave={handleSaveStory} 
          onCancel={() => setShowForm(false)}
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
                          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(story.priority)}`}>
                            {story.priority || 'Sin prioridad'}
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
