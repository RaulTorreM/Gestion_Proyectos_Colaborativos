// UserStoryBulkForm.jsx
import { useState, useEffect } from 'react';
import PrioritiesService from '../../../api/services/prioritiesService';
import UsersService from '../../../api/services/usersService';
import EpicsService from '../../../api/services/epicsService';
import { fetchIAWithHUPrompt } from '../../../utils/api_deepseek';
import { LoaderCircle } from 'lucide-react';

const formatToYYYYMMDD = (dateIsoOrDate) => {
  if (!dateIsoOrDate) return '';
  const date = typeof dateIsoOrDate === 'string' ? new Date(dateIsoOrDate) : dateIsoOrDate;
  return date.toISOString().split('T')[0];
};

const UserStoryBulkForm = ({ epicId, epicToEdit, onCancel, theme, onSaveBulk, onUserStoriesUpdated  }) => {
  const [proyectoContexto, setProyectoContexto] = useState({
    proyecto: '',
    descripcion_proyecto: '',
    epica: '',
    descripcion_epica: ''
  });
  const [priorities, setPriorities] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [userStoriesBulk, setUserStoriesBulk] = useState([]);

  // Rango de épica
  const epicStartDateString = formatToYYYYMMDD(epicToEdit.startDate);
  const epicDueDateString = formatToYYYYMMDD(epicToEdit.dueDate);

  // default HU sin _id
  const defaultHU = {
    name: '',
    description: '',
    priorityId: '',
    startDate: '',
    dueDate: '',
    status: 'Pendiente',
    endDate: '',
    assignedTo: [],
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
        const [prios, allUsers] = await Promise.all([
          PrioritiesService.getMoscowPriorities(),
          UsersService.getAllUsers()
        ]);
        setPriorities(prios || []);
        setUsers(allUsers || []);
      } catch (error) {
        console.error('Error al cargar datos bulk:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [epicId, epicToEdit]);

  const handleAddHU = () => {
    setUserStoriesBulk(prev => [...prev, { ...defaultHU }]);
  };

  const handleUpdateHU = (i, field, value) => {
    setUserStoriesBulk(prev => prev.map((hu, idx) => {
      if (idx !== i) return hu;
      if (field === 'assignedTo') {
        return { ...hu, assignedTo: value };
      }
      if (field === 'status') {
        const newHu = { ...hu, status: value };
        if (value !== 'Completado') newHu.endDate = '';
        return newHu;
      }
      return { ...hu, [field]: value };
    }));
  };

  const handleDeleteHU = i => {
    setUserStoriesBulk(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleGenerateIA = async () => {
    setIsGeneratingIA(true);
    try {
      const { proyecto, descripcion_proyecto, epica, descripcion_epica } = proyectoContexto;
      const data = await fetchIAWithHUPrompt(proyecto, descripcion_proyecto, epica, descripcion_epica);
      const generated = data.historias_usuario_IA || [];
      const converted = generated.map(hu => {
        const priority = priorities.find(p => p.moscowPriority === Number(hu.moscow_priority));
        return {
          name: hu.hu_name,
          description: hu.hu_description,
          priorityId: priority?._id || '',
          startDate: '', dueDate: '',
          status: 'Pendiente', endDate: '',
          assignedTo: [], epicId
        };
      });
      const filtered = converted.filter(gen =>
        !userStoriesBulk.some(existing =>
          existing.name === gen.name && existing.description === gen.description
        )
      );
      setUserStoriesBulk(prev => [...prev, ...filtered]);
    } catch (err) {
      console.error('Error generando con IA:', err);
      alert('Error al generar historias con IA');
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const handleAssignedChange = (i, selectedOptions) => {
    handleUpdateHU(i, 'assignedTo', selectedOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userStoriesBulk.length) return alert('Agrega al menos una historia de usuario.');
    // Validaciones por HU
    for (const hu of userStoriesBulk) {
      if (!hu.name.trim() || !hu.description.trim() || !hu.priorityId) {
        return alert('Cada HU necesita nombre, descripción y prioridad.');
      }
      // startDate rango épica
      if (hu.startDate) {
        if (epicStartDateString && hu.startDate < epicStartDateString) {
          return alert(`En HU "${hu.name}", la fecha de inicio no puede ser anterior a la de la épica (${epicStartDateString}).`);
        }
        if (epicDueDateString && hu.startDate > epicDueDateString) {
          return alert(`En HU "${hu.name}", la fecha de inicio no puede ser posterior a la fecha límite de la épica (${epicDueDateString}).`);
        }
      }
      if (hu.dueDate) {
        if (hu.startDate && hu.dueDate < hu.startDate) {
          return alert(`En HU "${hu.name}", la fecha límite no puede ser anterior a la de inicio.`);
        }
        if (epicStartDateString && hu.dueDate < epicStartDateString) {
          return alert(`En HU "${hu.name}", la fecha límite no puede ser anterior a la fecha de inicio de la épica (${epicStartDateString}).`);
        }
        if (epicDueDateString && hu.dueDate > epicDueDateString) {
          return alert(`En HU "${hu.name}", la fecha límite no puede ser posterior a la fecha límite de la épica (${epicDueDateString}).`);
        }
      }
      if (hu.status === 'Completado') {
        if (!hu.endDate) return alert(`En HU "${hu.name}", debe indicar fecha de finalización.`);
        if (hu.startDate && hu.endDate < hu.startDate) {
          return alert(`En HU "${hu.name}", la fecha de finalización no puede ser anterior a la de inicio.`);
        }
        if (epicStartDateString && hu.endDate < epicStartDateString) {
          return alert(`En HU "${hu.name}", la fecha de finalización no puede ser anterior a la fecha de inicio de la épica (${epicStartDateString}).`);
        }
        if (epicDueDateString && hu.endDate > epicDueDateString) {
          return alert(`En HU "${hu.name}", la fecha de finalización no puede ser posterior a la fecha límite de la épica (${epicDueDateString}).`);
        }
      }
      // assignedTo: opcional
    }
    // Construir payloads
    const arr = userStoriesBulk.map(hu => ({
      name: hu.name.trim(),
      description: hu.description.trim(),
      priorityId: hu.priorityId || null,
      epicId,
      status: hu.status,
      assignedTo: hu.assignedTo,
      startDate: hu.startDate ? new Date(hu.startDate).toISOString() : undefined,
      dueDate: hu.dueDate ? new Date(hu.dueDate).toISOString() : undefined,
      endDate: (hu.status === 'Completado' && hu.endDate)
        ? new Date(hu.endDate).toISOString()
        : undefined
    }));
    onSaveBulk(arr).then(async () => {
        // ✅ Nuevo paso: actualizar la lista real
        if (onUserStoriesUpdated) {
          try {
            await onUserStoriesUpdated();  // puede usar handleUserStoryUpdate dentro
          } catch (err) {
            console.error('Error actualizando HU luego de guardar:', err);
          }
        }
    
        // ✅ Opcional: cerrar modal después de guardar
        onCancel();
      });
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
      <h4 className="font-semibold">Generar o agregar múltiples Historias</h4>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAddHU}
          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white"
        >
          Agregar HU manual
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

      {userStoriesBulk.map((hu, i) => (
        <div key={i} className="p-4 border rounded bg-gray-100 dark:bg-zinc-700 space-y-2">
          {/* Nombre */}
          <input
            type="text"
            placeholder="Nombre HU"
            value={hu.name}
            onChange={e => handleUpdateHU(i, 'name', e.target.value)}
            className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
            required
          />
          {/* Descripción */}
          <textarea
            placeholder="Descripción HU"
            value={hu.description}
            onChange={e => handleUpdateHU(i, 'description', e.target.value)}
            className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
            required
          />
          {/* Prioridad */}
          <select
            value={hu.priorityId}
            onChange={e => handleUpdateHU(i, 'priorityId', e.target.value)}
            className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
            required
          >
            <option value="">Seleccionar prioridad</option>
            {priorities.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          {/* Fechas y estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-sm">Fecha Inicio</label>
              <input
                type="date"
                value={hu.startDate}
                onChange={e => handleUpdateHU(i, 'startDate', e.target.value)}
                min={epicStartDateString || undefined}
                max={epicDueDateString || undefined}
                className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Fecha Límite</label>
              <input
                type="date"
                value={hu.dueDate}
                onChange={e => handleUpdateHU(i, 'dueDate', e.target.value)}
                min={hu.startDate || epicStartDateString || undefined}
                max={epicDueDateString || undefined}
                className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Estado</label>
              <select
                value={hu.status}
                onChange={e => handleUpdateHU(i, 'status', e.target.value)}
                className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completado">Completado</option>
              </select>
            </div>
          </div>
          {hu.status === 'Completado' && (
            <div>
              <label className="block mb-1 text-sm">Fecha de Finalización</label>
              <input
                type="date"
                value={hu.endDate}
                onChange={e => handleUpdateHU(i, 'endDate', e.target.value)}
                min={hu.startDate || epicStartDateString || undefined}
                max={epicDueDateString || undefined}
                className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
                required
              />
            </div>
          )}
          {/* Asignación multiple */}
          <div>
            <label className="block mb-1 text-sm">Asignar a</label>
            <select
              multiple
              value={hu.assignedTo}
              onChange={e => {
                const opts = Array.from(e.target.selectedOptions).map(opt => opt.value);
                handleAssignedChange(i, opts);
              }}
              className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
            >
              {users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
            <p className="text-sm text-gray-500">Mantén pulsado Ctrl/Cmd para seleccionar varios.</p>
          </div>
          {/* Botón eliminar HU temporal */}
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

export default UserStoryBulkForm;
