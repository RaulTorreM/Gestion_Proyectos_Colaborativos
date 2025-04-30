import { useState } from 'react';
import UserStoryList from './UserStoryList';

const TaskDetail = ({ task, allMembers, getMemberById, onClose, onSave, theme }) => {
  const [editing, setEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave({
      ...editedTask,
      assignee: Number(editedTask.assignee)
    });
  };

  const updateUserStories = (updatedUserStories) => {
    setEditedTask(prev => ({ ...prev, userStories: updatedUserStories }));
  };

  const assignedMember = getMemberById(task.assignee);

  return (
    <div className={`rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {editing ? 'Editando Tarea' : 'Detalle de Tarea'}
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
            <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Título</label>
            <input
              type="text"
              name="title"
              value={editedTask.title}
              onChange={handleInputChange}
              className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>

          <div>
            <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Descripción</label>
            <textarea
              name="description"
              value={editedTask.description}
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
                value={editedTask.startDate}
                onChange={handleInputChange}
                className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Fecha Fin</label>
              <input
                type="date"
                name="endDate"
                value={editedTask.endDate}
                onChange={handleInputChange}
                className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          <div>
            <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Asignado a</label>
            <select
              name="assignee"
              value={editedTask.assignee}
              onChange={handleInputChange}
              className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
            >
              {allMembers.map(member => (
                <option key={member.userId} value={member.userId}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Prioridad</label>
            <select
              name="priority"
              value={editedTask.priority}
              onChange={handleInputChange}
              className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {task.title}
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {task.description}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Fecha Inicio:</span> {task.startDate}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Fecha Fin:</span> {task.endDate}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Asignado a:</span> {assignedMember.name} ({assignedMember.role})
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Prioridad:</span> {task.priority}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Historias de Usuario
        </h3>
        <UserStoryList 
          userStories={editing ? editedTask.userStories : task.userStories} 
          editing={editing}
          onUpdate={updateUserStories}
          theme={theme}
          allMembers={allMembers}
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
              Editar Tarea
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;