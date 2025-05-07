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
    <form onSubmit={handleSubmit} className={`space-y-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-white text-gray-800'}`}>
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Descripción *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium">Prioridad</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
          >
            <option value="Must">Must</option>
            <option value="Should">Should</option>
            <option value="Could">Could</option>
            <option value="Wont">Wont</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium">Estado</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En progreso">En progreso</option>
            <option value="Completada">Completada</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-gray-800">Cancelar</button>
        <button type="submit" className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white">Guardar</button>
      </div>
    </form>
  );
};

export default UserStoryForm;
