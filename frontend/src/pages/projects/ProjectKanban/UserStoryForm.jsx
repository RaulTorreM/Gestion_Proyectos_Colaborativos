import { useState, useEffect } from 'react';
import PrioritiesService from '../../../api/services/prioritiesService';
import EpicsService from '../../../api/services/epicsService';
import { fetchChatWithHUPrompt } from '../../../utils/api_deepseek';

const UserStoryForm = ({ epicId, epicToEdit, onSave, onCancel, theme }) => {
  const [proyectoContexto, setProyectoContexto] = useState({
    proyecto: '',
    descripcion_proyecto: '',
    epica: '',
    descripcion_epica: ''
  });

  const [priorities, setPriorities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [userStories, setUserStories] = useState([]);

  const defaultHU = {
    name: '',
    description: '',
    priorityId: null,
    status: 'Pendiente',
    _id: null
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const epicData = await EpicsService.getEpicById(epicId);
        const project = epicData.projectId || {};

        setProyectoContexto({
          proyecto: project.name || '',
          descripcion_proyecto: project.description || '',
          epica: epicToEdit.name || '',
          descripcion_epica: epicToEdit.description || ''
        });

        const prioritiesData = await PrioritiesService.getMoscowPriorities();
        setPriorities(prioritiesData || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [epicId, epicToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const emptyDescriptions = userStories.filter(hu => !hu.description?.trim());
    if (emptyDescriptions.length > 0) {
      alert('Todas las historias deben tener descripción');
      return;
    }
    if (userStories.length === 0) {
      alert('Agrega al menos una historia de usuario antes de guardar.');
      return;
    }
    onSave(userStories);
  };

  const handleAddHU = () => {
    setUserStories(prev => [...prev, { ...defaultHU }]);
  };

  const handleUpdateHU = (index, field, value) => {
    setUserStories(prev =>
      prev.map((hu, i) =>
        i === index ? { ...hu, [field]: value } : hu
      )
    );
  };

  const handleDeleteHU = (index) => {
    setUserStories(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateIA = async () => {
    setIsGeneratingIA(true);
    try {
      const { proyecto, descripcion_proyecto, epica, descripcion_epica } = proyectoContexto;

      const data = await fetchChatWithHUPrompt(
        proyecto,
        descripcion_proyecto,
        epica,
        descripcion_epica
      );

      const generated = data.historias_usuario_IA || [];

      const converted = generated.map(hu => {
        const priority = priorities.find(p => p.moscowPriority === Number(hu.moscow_priority));
        return {
          name: hu.hu_name,
          description: hu.hu_description,
          priorityId: priority?._id || null,
          status: 'Pendiente'
        };
      });

      const noDuplicates = converted.filter(
        gen => !userStories.some(
          existing => existing.name === gen.name && existing.description === gen.description
        )
      );

      setUserStories(prev => [...prev, ...noDuplicates]);
    } catch (err) {
      console.error('Error generando con IA:', err);
      alert('Error al generar historias con IA');
    } finally {
      setIsGeneratingIA(false);
    }
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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAddHU}
          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white"
        >
          Agregar HU
        </button>
        <button
          type="button"
          onClick={handleGenerateIA}
          disabled={isGeneratingIA}
          className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          {isGeneratingIA ? 'Generando...' : 'Generar HUs con IA'}
        </button>
      </div>

      {userStories.map((story, idx) => (
        <div key={idx} className="p-4 border rounded bg-gray-100 dark:bg-zinc-700 space-y-2">
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={story.name}
              onChange={(e) => handleUpdateHU(idx, 'name', e.target.value)}
              className={`w-full px-3 py-2 rounded border ${theme === 'dark'
                ? 'bg-zinc-700 text-white border-zinc-600'
                : 'border-gray-300'
                }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Descripción *</label>
            <textarea
              value={story.description}
              onChange={(e) => handleUpdateHU(idx, 'description', e.target.value)}
              className={`w-full px-3 py-2 rounded border ${theme === 'dark'
                ? 'bg-zinc-700 text-white border-zinc-600'
                : 'border-gray-300'
                }`}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Prioridad</label>
              <select
                value={story.priorityId || ''}
                onChange={(e) => handleUpdateHU(idx, 'priorityId', e.target.value)}
                className={`w-full px-3 py-2 rounded border ${theme === 'dark'
                  ? 'bg-zinc-700 text-white border-zinc-600'
                  : 'border-gray-300'
                  }`}
              >
                <option value="">Seleccionar prioridad</option>
                {priorities.map(priority => (
                  <option key={priority._id} value={priority._id}>
                    {priority.name} (Nivel {priority.moscowPriority})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium">Estado</label>
              <select
                value={story.status}
                onChange={(e) => handleUpdateHU(idx, 'status', e.target.value)}
                className={`w-full px-3 py-2 rounded border ${theme === 'dark'
                  ? 'bg-zinc-700 text-white border-zinc-600'
                  : 'border-gray-300'
                  }`}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En progreso">En progreso</option>
                <option value="Completado">Completada</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleDeleteHU(idx)}
            className="text-red-500 hover:text-red-700 font-bold mt-2"
          >
            ❌ Eliminar
          </button>
        </div>
      ))}

      <div className="flex gap-2 justify-end mt-4">
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
          Guardar todas
        </button>
      </div>
    </form>
  );
};

export default UserStoryForm;
