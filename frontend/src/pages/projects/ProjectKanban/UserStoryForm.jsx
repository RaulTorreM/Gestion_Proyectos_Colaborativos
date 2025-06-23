import { useState, useEffect } from 'react';
import PrioritiesService from '../../../api/services/prioritiesService';
import EpicsService from '../../../api/services/epicsService';
import UserStoriesService from '../../../api/services/userStoriesService';
import { fetchChatWithHUPrompt } from '../../../utils/api_deepseek';
import { LoaderCircle } from 'lucide-react';

const UserStoryForm = ({ epicId, epicToEdit, onCancel, theme, onSaveSuccess }) => {
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
    priorityId: '',
    status: 'Pendiente',
    epicId
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

  const handleAddHU = () => {
    setUserStories(prev => [...prev, { ...defaultHU }]);
  };

  const handleUpdateHU = (i, field, value) => {
    setUserStories(prev => prev.map(
      (hu, idx) => idx === i ? { ...hu, [field]: value } : hu
    ));
  };

  const handleDeleteHU = i => {
    setUserStories(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleGenerateIA = async () => {
    setIsGeneratingIA(true);
    try {
      const { proyecto, descripcion_proyecto, epica, descripcion_epica } = proyectoContexto;
      const data = await fetchChatWithHUPrompt(proyecto, descripcion_proyecto, epica, descripcion_epica);
      const generated = data.historias_usuario_IA || [];

      const converted = generated.map(hu => {
        const priority = priorities.find(p => p.moscowPriority === Number(hu.moscow_priority));
        return {
          name: hu.hu_name,
          description: hu.hu_description,
          priorityId: priority?._id || '',
          status: 'Pendiente',
          epicId: epicToEdit._id
        };
      });

      const filtered = converted.filter(gen =>
        !userStories.some(existing =>
          existing.name === gen.name && existing.description === gen.description
        )
      );

      setUserStories(prev => [...prev, ...filtered]);
    } catch (err) {
      console.error('Error generando con IA:', err);
      alert('Error al generar historias con IA');
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!userStories.length) return alert('Agrega al menos una historia de usuario.');

    const invalid = userStories.some(hu => !hu.description.trim() || !hu.name.trim());
    if (invalid) return alert('Todas las HUs necesitan nombre y descripción.');

    try {
      setIsLoading(true);
      console.log(userStories);
      const result = await UserStoriesService.createUserStoriesBulk(userStories);
      onSaveSuccess?.(result);
    } catch (err) {
      console.error('Bulk create error:', err);
      alert('Ocurrió un error al guardar las historias.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="flex gap-2">
        <button type="button" onClick={handleAddHU} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white">
          Agregar HU
        </button>
        <button
          type="button"
          onClick={handleGenerateIA}
          disabled={isGeneratingIA}
          className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          {isGeneratingIA ? (
            <span className="flex items-center gap-2">
              Generando
              <LoaderCircle className="animate-spin w-5 h-5 text-white" />
            </span>
          ) : (
            'Generar HUs con IA'
          )}
        </button>
      </div>

      {userStories.map((hu, i) => (
        <div key={i} className="p-4 border rounded bg-gray-100 dark:bg-zinc-700 space-y-2">
          <input
            type="text"
            placeholder="Nombre HU"
            value={hu.name}
            onChange={e => handleUpdateHU(i, 'name', e.target.value)}
            className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
            required
          />

          <textarea
            placeholder="Descripción HU"
            value={hu.description}
            onChange={e => handleUpdateHU(i, 'description', e.target.value)}
            className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
            required
          />

          <div className="flex gap-4">
            <select
              value={hu.priorityId}
              onChange={e => handleUpdateHU(i, 'priorityId', e.target.value)}
              className={`flex-1 px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
              required
            >
              <option value="">Seleccionar prioridad</option>
              {priorities.map(p => (
                <option key={p._id} value={p._id}>{p.name} (Nivel {p.moscowPriority})</option>
              ))}
            </select>

            <select
              value={hu.status}
              onChange={e => handleUpdateHU(i, 'status', e.target.value)}
              className={`flex-1 px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
              required
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Completado">Completada</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => handleDeleteHU(i)}
            className="text-red-500 hover:text-red-700 font-bold mt-2"
          >
            ❌ Eliminar HU
          </button>
        </div>
      ))}

      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-gray-800">
          Cancelar
        </button>
        <button type="submit" className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white">
          Guardar todas
        </button>
      </div>
    </form>
  );
};

export default UserStoryForm;
