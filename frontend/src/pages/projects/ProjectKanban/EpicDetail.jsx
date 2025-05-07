import { useState } from 'react';
import UserStoryList from './UserStoryList';

const EpicDetail = ({ epic, priorities = [], onClose, onSave, theme }) => {
  const [editing, setEditing] = useState(false);
  const [editedEpic, setEditedEpic] = useState({ 
    ...epic,
    dueDate: epic.dueDate,
    priority: epic.priority || (priorities.length > 0 ? priorities[0] : null)
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEpic(prev => ({ 
      ...prev, 
      [name]: value,
      ...(name === 'dueDate' && { dueDate: value })
    }));
  };

  const handlePriorityChange = (priorityId) => {
    const selectedPriority = priorities.find(p => p._id === priorityId);
    setEditedEpic(prev => ({
      ...prev,
      priority: selectedPriority
    }));
  };

  const handleSave = () => {
    const taskToSave = {
      ...editedEpic,
      priorityId: editedEpic.priority?._id
    };
    onSave(taskToSave);
  };

  const updateUserStories = (updatedUserStories) => {
    setEditedEpic(prev => ({ ...prev, userStories: updatedUserStories }));
  };

  return (
    <div className={`rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {editing ? 'Editando Épica' : 'Detalle de Épica'}
        </h2>
        <button 
          onClick={onClose}
          className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-200'}`}
        >
          ✕
        </button>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Nombre*</label>
            <input
              type="text"
              name="name"
              value={editedEpic.name || ''}
              onChange={handleInputChange}
              className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
              required
            />
          </div>

          <div>
            <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Descripción</label>
            <textarea
              name="description"
              value={editedEpic.description || ''}
              onChange={handleInputChange}
              rows="3"
              className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Fecha Inicio</label>
              <input
                type="date"
                name="startDate"
                value={editedEpic.startDate || ''}
                onChange={handleInputChange}
                className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Fecha Fin</label>
              <input
                type="date"
                name="endDate"
                value={editedEpic.endDate || ''}
                onChange={handleInputChange}
                className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Prioridad</label>
              <select
                value={editedEpic.priority?._id || ''}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
              >
                {priorities.map(priority => (
                  <option key={priority._id} value={priority._id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Estado</label>
              <select
                name="status"
                value={editedEpic.status || 'Pendiente'}
                onChange={handleInputChange}
                className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
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
                <span className="font-medium">Fecha Inicio:</span> {epic.startDate || 'No definida'}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Fecha Fin:</span> {epic.endDate || 'No definida'}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Prioridad:</span> {epic.priority?.name || 'No definida'}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Estado:</span> {epic.status || 'Pendiente'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <UserStoryList 
          userStories={editing ? editedEpic.userStories || [] : epic.userStories || []} 
          editing={editing}
          onUpdate={updateUserStories}
          theme={theme}
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        {editing ? (
          <>
            <button
              onClick={() => setEditing(false)}
              className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Guardar Cambios
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
            >
              Cerrar
            </button>
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Editar Épica
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EpicDetail;