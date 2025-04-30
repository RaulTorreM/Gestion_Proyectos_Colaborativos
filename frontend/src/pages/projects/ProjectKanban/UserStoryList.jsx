import { useState } from 'react';
import UserStoryForm from './UserStoryForm';

const UserStoryList = ({ userStories = [], editing, onUpdate, theme, allMembers  }) => {
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
    
    if (story.id) {
      updatedStories = userStories.map(us => 
        us.id === story.id ? story : us
      );
    } else {
      updatedStories = [...userStories, {
        ...story,
        id: `us${Date.now()}`
      }];
    }

    onUpdate(updatedStories);
    setShowForm(false);
  };

  const handleDeleteStory = (storyId) => {
    const updatedStories = userStories.filter(us => us.id !== storyId);
    onUpdate(updatedStories);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Must': return 'bg-red-100 text-red-800';
      case 'Should': return 'bg-yellow-100 text-yellow-800';
      case 'Could': return 'bg-blue-100 text-blue-800';
      case 'Wont': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {showForm ? (
        <UserStoryForm 
        story={editingStory} 
        onSave={handleSaveStory} 
        onCancel={() => setShowForm(false)}
        theme={theme}
        allMembers={allMembers}
        />
      ) : (
        <div>
          {editing && (
            <button
              onClick={handleAddStory}
              className={`mb-4 px-3 py-1 rounded-lg ${theme === 'dark' ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-green-100 hover:bg-green-200 text-green-800'}`}
            >
              + Agregar Historia
            </button>
          )}

          {userStories.length === 0 ? (
            <p className={`italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No hay historias de usuario registradas
            </p>
          ) : (
            <div className="space-y-3">
              {userStories.map((story) => (
                <div 
                  key={story.id}
                  className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                        {story.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-3">
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(story.priority)}`}>
                          {story.priority}
                        </span>
                        {story.assignee && (
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Asignado a: {story.assignee}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {editing && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditStory(story)}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-zinc-600 text-blue-400' : 'hover:bg-gray-200 text-blue-600'}`}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteStory(story.id)}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-zinc-600 text-red-400' : 'hover:bg-gray-200 text-red-600'}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserStoryList;