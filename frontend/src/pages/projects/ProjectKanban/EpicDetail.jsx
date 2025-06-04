import { useState } from 'react';
import UserStoryList from './UserStoryList';
import { formatISO, parseISO } from 'date-fns';
import { formatDateToUserTimezone } from './KanbanDateUtils';
import UserStoriesService from '../../../api/services/userStoriesService';
import { toast } from 'react-toastify';

const EpicDetail = ({ epic, priorities = [], onClose, onSave, onDelete, theme }) => {
  const [editing, setEditing] = useState(false);
  
  const parseDate = (date) => {
    try {
      return date ? formatISO(typeof date === 'string' ? parseISO(date) : date) : null;
    } catch {
      return null;
    }
  };

  const [editedEpic, setEditedEpic] = useState({
    ...epic,
    startDate: parseDate(epic.startDate),
    endDate: parseDate(epic.endDate),
    dueDate: parseDate(epic.dueDate),
    priorityId: epic.priorityId?._id || epic.priorityId || null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEpic(prev => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (selectedPriorityId) => {
    // Validar que sea un ID existente en las prioridades
    const isValid = priorities.some(p => p._id === selectedPriorityId);
    
    setEditedEpic(prev => ({
      ...prev,
      priorityId: isValid ? selectedPriorityId : prev.priorityId
    }));
  };

  const handleSave = () => {
    // Mantener _id en el payload
    const { 
      __v, createdAt, updatedAt, deletedAt, authorUserId, id, title, 
      ...epicToSave 
    } = editedEpic;
  
    const payload = {
      ...epicToSave,
      _id: editedEpic._id, // ← Asegurar que _id está incluido
      startDate: epicToSave.startDate || null,
      endDate: epicToSave.endDate || null,
      dueDate: epicToSave.dueDate ? new Date(epicToSave.dueDate).toISOString() : null
    };
  
    onSave(payload);
    setEditing(false);
  };

  // Modificar la función updateUserStories
  const updateUserStories = async (updatedStories) => {
    try {
      // Solo actualiza las stories que han cambiado
      const updatePromises = updatedStories
        .filter(story => story._id?.startsWith('us-') || story.isModified)
        .map(async (story) => {
          if (story._id?.startsWith('us-')) {
            const { _id, ...cleanStory } = story;
            const createdStory = await UserStoriesService.createUserStory({
              ...cleanStory,
              epicId: epic._id
            });
            return createdStory;
          } else {
            return await UserStoriesService.updateUserStory(story._id, story);
          }
        });
  
      const savedStories = await Promise.all(updatePromises);
      
      // Actualiza solo las stories modificadas en el estado local
      setEditedEpic(prev => {
        const existingStories = prev.userStories.filter(s => !s._id?.startsWith('us-'));
        const newStories = savedStories.filter(s => !existingStories.some(es => es._id === s._id));
        
        return {
          ...prev,
          userStories: [...existingStories, ...newStories].map(story => {
            const updated = savedStories.find(s => s._id === story._id);
            return updated || story;
          })
        };
      });
      
    } catch (error) {
      console.error('Error updating user stories:', error);
      toast.error('Error al actualizar historias');
    }
  };

  return (
    <div className={`rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg ${
      theme === 'dark' 
        ? 'bg-zinc-800 text-white' 
        : 'bg-white text-gray-800'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {editing ? 'Editando Épica' : 'Detalle de Épica'}
        </h2>
        <button 
          onClick={onClose}
          className={`p-2 rounded-full hover:bg-opacity-20 ${
            theme === 'dark' ? 'hover:bg-white' : 'hover:bg-gray-200'
          }`}
        >
          ✕
        </button>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Nombre*
            </label>
            <input
              className={`w-full p-2 rounded border ${
                theme === 'dark' 
                  ? 'bg-zinc-700 border-zinc-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
              name="name"
              value={editedEpic.name || ''}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Descripción
            </label>
            <textarea
              className={`w-full p-2 rounded border ${
                theme === 'dark' 
                  ? 'bg-zinc-700 border-zinc-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}
              name="description"
              value={editedEpic.description || ''}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Fecha Inicio
              </label>
              <input
                className={`w-full p-2 rounded border ${
                  theme === 'dark' 
                    ? 'bg-zinc-700 border-zinc-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                type="date"
                name="startDate"
                value={editedEpic.startDate?.split('T')[0] || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Fecha Fin
              </label>
              <input
                className={`w-full p-2 rounded border ${
                  theme === 'dark' 
                    ? 'bg-zinc-700 border-zinc-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                type="date"
                name="dueDate"
                value={editedEpic.dueDate?.split('T')[0] || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Prioridad
              </label>
              <select
                className={`w-full p-2 rounded border ${
                  theme === 'dark' 
                    ? 'bg-zinc-700 border-zinc-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                value={editedEpic.priorityId || ''}
                onChange={(e) => handlePriorityChange(e.target.value)}
              >
                <option value="">Seleccionar prioridad</option>
                {priorities.map(priority => (
                  <option key={priority._id} value={priority._id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Estado
              </label>
              <select
                className={`w-full p-2 rounded border ${
                  theme === 'dark' 
                    ? 'bg-zinc-700 border-zinc-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                name="status"
                value={editedEpic.status || 'Pendiente'}
                onChange={handleInputChange}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completado">Completado</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {epic.name}
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {epic.description || 'Sin descripción'}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Fecha Inicio:</span> {formatDateToUserTimezone(epic.startDate)}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Fecha Fin:</span> {formatDateToUserTimezone(epic.dueDate)}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Prioridad:</span> {epic.priorityId?.name || 'No definida'}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Estado:</span> {epic.status || 'Pendiente(D)'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <UserStoryList
          userStories={(editing ? editedEpic.userStories : epic.userStories) || []}
          editing={editing}
          onUpdate={updateUserStories}
          theme={theme}
          epicId={epic._id}
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        {editing ? (
          <>
            <button
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
              onClick={() => setEditing(false)}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              onClick={handleSave}
            >
              Guardar
            </button>
          </>
        ) : (
          <>
            <button
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
              onClick={onClose}
            >
              Cerrar
            </button>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              onClick={() => setEditing(true)}
            >
              Editar
            </button>
            <button 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              onClick={() => onDelete(epic._id)}
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EpicDetail;