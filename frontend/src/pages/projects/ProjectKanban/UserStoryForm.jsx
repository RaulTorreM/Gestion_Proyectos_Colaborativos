import { useState, useEffect } from 'react';
import PrioritiesService from '../../../api/services/prioritiesService';

const UserStoryForm = ({ story, onSave, onCancel, theme }) => {
  const [priorities, setPriorities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: story?.name || '',
    description: story?.description || '',
    priorityId: story?.priorityId?._id || story?.priorityId || null,
    status: story?.status || 'Pendiente',
    _id: story?._id || null
  });

  // Cargar prioridades al montar el componente
  useEffect(() => {
    const fetchPriorities = async () => {
      setIsLoading(true);
      try {
        const prioritiesData = await PrioritiesService.getMoscowPriorities();
        setPriorities(prioritiesData || []);
        
        // Si no hay prioridad seleccionada, establecer la primera como default
        if (!formData.priorityId && prioritiesData.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            priorityId: prioritiesData.data[0]._id
          }));
        }
      } catch (error) {
        console.error('Error fetching priorities:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPriorities();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
            name="priorityId"
            value={formData.priorityId || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
          >
            <option value="">Seleccionar prioridad</option>
            {priorities.map(priority => (
              <option 
                key={priority._id} 
                value={priority._id}
              >
                {priority.name} (Nivel {priority.moscowPriority})
              </option>
            ))}
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
            <option value="Completado">Completada</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default UserStoryForm;