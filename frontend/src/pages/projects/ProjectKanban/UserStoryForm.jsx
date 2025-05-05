import { useState } from 'react';

const UserStoryForm = ({ story, onSave, onCancel, theme }) => {
  const [formData, setFormData] = useState({
    name: story?.name || '',
    description: story?.description || '',
    priority: story?.priority || 'Should',
    status: story?.status || 'Pendiente',
    _id: story?._id || null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      alert('La descripción es requerida');
      return;
    }
    onSave(formData);
  };

  return (
    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} border ${theme === 'dark' ? 'border-zinc-700' : 'border-gray-200'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Nombre (opcional)</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        <div>
          <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Descripción*</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Prioridad</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="Must">Must (Debe tener)</option>
              <option value="Should">Should (Debería tener)</option>
              <option value="Could">Could (Podría tener)</option>
              <option value="Wont">Won't (No tendrá)</option>
            </select>
          </div>
          <div>
            <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Estado</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 border-zinc-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Completado">Completado</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {formData._id ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserStoryForm;