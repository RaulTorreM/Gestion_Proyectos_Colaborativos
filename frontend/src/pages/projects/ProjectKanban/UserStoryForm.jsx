import { useState } from 'react';

const UserStoryForm = ({ story, onSave, onCancel, theme, allMembers }) => {
  const [formData, setFormData] = useState(story || {
    description: '',
    priority: 'Should',
    assignee: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'}`}>
      <div className="mb-4">
        <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Descripción*
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="3"
          className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-600 border-zinc-500 text-white' : 'bg-white border-gray-300'}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Prioridad*
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-600 border-zinc-500 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="Must">Must (Debe tener)</option>
            <option value="Should">Should (Debería tener)</option>
            <option value="Could">Could (Podría tener)</option>
            <option value="Wont">Won't (No tendrá ahora)</option>
          </select>
        </div>

        <div>
          <label className={`block mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Asignado a
          </label>
          <select
            name="assignee"
            value={formData.assignee}
            onChange={handleChange}
            className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-zinc-600 border-zinc-500 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="">Seleccionar miembro</option>
            {allMembers.map(member => (
              <option key={member.userId} value={member.userId}>
                {member.name} ({member.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-600 hover:bg-zinc-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          {story ? 'Actualizar' : 'Agregar'} Historia
        </button>
      </div>
    </form>
  );
};

export default UserStoryForm;