import { useState, useEffect } from 'react';

const AddEpicModal = ({ onClose, onSave, theme, priorities, projectStartDate, projectDueDate }) => {
  // Estado para manejar errores específicos
  const [priorityError, setPriorityError] = useState('');

  // Asegurar que siempre haya un priorityId válido
  const initialPriorityId = priorities.length > 0 ? priorities[0]._id : '';
  
  // console.log('projectStartDate', projectStartDate);
  // console.log('projectDueDate', projectDueDate);
  
  const [newEpic, setNewEpic] = useState({
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
    priorityId: initialPriorityId
  });

  // Actualizar el estado cuando las prioridades cambien
  useEffect(() => {
    if (priorities.length > 0 && !priorities.some(p => p._id === newEpic.priorityId)) {
      setNewEpic(prev => ({
        ...prev,
        priorityId: priorities[0]._id
      }));
    }
  }, [priorities]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEpic(prev => ({ ...prev, [name]: value }));
    setPriorityError(''); // Limpiar error al cambiar
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación de fechas
    if (new Date(newEpic.dueDate) < new Date(newEpic.startDate)) {
      alert('La fecha límite no puede ser anterior a la fecha de inicio');
      return;
    }

    // Validación de nombre
    if (!newEpic.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    // Validación de prioridad
    const selectedPriority = priorities.find(priority => priority._id === newEpic.priorityId);
    if (!selectedPriority) {
      setPriorityError('Seleccione una prioridad válida');
      return;
    }

    // Solo pasar datos necesarios al backend
    onSave({
      name: newEpic.name,
      description: newEpic.description,
      startDate: newEpic.startDate,
      dueDate: newEpic.dueDate,
      priorityId: newEpic.priorityId, // Solo el ID, no el objeto completo
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
          aria-label="Cerrar"
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
            value={newEpic.name}
            onChange={handleInputChange}
            className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
            required
          />
        </div>

        <div>
          <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Descripción</label>
          <textarea
            name="description"
            value={newEpic.description}
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
              value={newEpic.startDate}
              onChange={handleInputChange}
              min={projectStartDate}
              max={projectDueDate}
              className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
              required
            />
          </div>
          <div>
            <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Fecha Límite*</label>
            <input
              type="date"
              name="dueDate"
              value={newEpic.dueDate}
              onChange={handleInputChange}
              min={newEpic.startDate || projectStartDate}
              max={projectDueDate}
              className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
              required
            />
          </div>
        </div>

        <div>
          <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Prioridad*</label>
          <select
            name="priorityId"
            value={newEpic.priorityId}
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
          {priorityError && (
            <p className="text-red-500 text-sm mt-1">{priorityError}</p>
          )}
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

export default AddEpicModal;