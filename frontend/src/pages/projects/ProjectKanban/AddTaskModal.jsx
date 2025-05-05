import { useState } from 'react';

const AddTaskModal = ({ onClose, onSave, theme, priorities }) => {
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: priorities.length > 0 ? priorities[0]._id : '',
    status: 'Pendiente'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (new Date(newTask.endDate) < new Date(newTask.startDate)) {
      alert('La fecha de fin no puede ser anterior a la fecha de inicio');
      return;
    }

    if (!newTask.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    onSave({
      ...newTask,
      dueDate: newTask.endDate
    });
  };

  return (
    <div className={`rounded-xl p-6 w-full max-w-md ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Agregar Nueva Épica
        </h2>
        <button 
          onClick={onClose}
          className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-200'}`}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Nombre*</label>
          <input
            type="text"
            name="name"
            value={newTask.name}
            onChange={handleInputChange}
            className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
            required
          />
        </div>

        <div>
          <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Descripción</label>
          <textarea
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            rows="3"
            className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Fecha Inicio*</label>
            <input
              type="date"
              name="startDate"
              value={newTask.startDate}
              onChange={handleInputChange}
              className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
              required
            />
          </div>
          <div>
            <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Fecha Fin*</label>
            <input
              type="date"
              name="endDate"
              value={newTask.endDate}
              onChange={handleInputChange}
              min={newTask.startDate}
              className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Prioridad*</label>
            <select
              name="priority"
              value={newTask.priority}
              onChange={handleInputChange}
              className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
              required
            >
              {priorities.map(priority => (
                <option key={priority._id} value={priority._id}>
                  {priority.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Estado*</label>
            <select
              name="status"
              value={newTask.status}
              onChange={handleInputChange}
              className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
              required
            >
              <option value="Pendiente">Por hacer</option>
              <option value="En Progreso">En progreso</option>
              <option value="Completado">Completado</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Crear Épica
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTaskModal;