import { useState, useEffect } from 'react';
import UserStoryList from './UserStoryList';
import { formatISO, parseISO } from 'date-fns';
import { formatDateToUserTimezone } from './KanbanDateUtils';
import UserStoriesService from '../../../api/services/userStoriesService';
import PrioritiesService from '../../../api/services/prioritiesService';
import EpicsService from '../../../api/services/epicsService';
import { toast } from 'react-toastify';
import { useCallback } from 'react';

const EpicDetail = ({ epic, onClose, onSave, onDelete, theme , onUpdateUserStories}) => {
  const [editing, setEditing] = useState(false);

  // Estado para la épica editada
  const parseDate = (date) => {
    try {
      return date ? formatISO(typeof date === 'string' ? parseISO(date) : date) : null;
    } catch {
      return null;
    }
  };

  const [editedEpic, setEditedEpic] = useState({
    ...epic,
    userStories: epic.userStories || [],
    priorityId: epic.priorityId?._id || epic.priorityId || ''
  });

  const refreshEpic = async () => {
    try {
      const fresh = await EpicsService.getEpicById(editedEpic._id);
      const filteredUserStories = await UserStoriesService.getUserStoriesByEpic(editedEpic._id);
      setEditedEpic({
        ...fresh,
        userStories: filteredUserStories,
        priorityId: fresh.priorityId?._id || fresh.priorityId || ''
      });
    } catch (err) {
      console.error('Error refrescando épica:', err);
      toast.error('No se pudo recargar la épica');
    }
  };




  const [noMoscowPriorities, setNoMoscowPriorities] = useState([]);
  const [isLoadingPriorities, setIsLoadingPriorities] = useState(false);

  useEffect(() => {
    const fetchPriorities = async () => {
      setIsLoadingPriorities(true);
      try {
        // Obtener prioridades NO MOSCOW
        const prios = await PrioritiesService.getNoMoscowPriorities();
        setNoMoscowPriorities(prios || []);
      } catch (err) {
        console.error('Error cargando prioridades:', err);
        toast.error('No se pudieron cargar prioridades');
      } finally {
        setIsLoadingPriorities(false);
      }
    };
    fetchPriorities();
  }, []);

  useEffect(() => {
    const loadFromServer = async () => {
      try {
        const fresh = await EpicsService.getEpicById(epic._id);
        const filteredUserStories = await UserStoriesService.getUserStoriesByEpic(epic._id);
  
        setEditedEpic({
          ...fresh,
          userStories: filteredUserStories,
          priorityId: fresh.priorityId?._id || fresh.priorityId || ''
        });
      } catch (err) {
        console.error('Error cargando épica:', err);
        toast.error('No se pudo cargar la épica');
      }
    };
  
    loadFromServer();
  }, [epic]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEpic(prev => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (selectedPriorityId) => {
    const isValid = noMoscowPriorities.some(p => p._id === selectedPriorityId);
    setEditedEpic(prev => ({
      ...prev,
      priorityId: isValid ? selectedPriorityId : prev.priorityId
    }));
  };

  const handleSave = async  () => {
    try {
      const epicToSave = {
        name:        editedEpic.name,
        description: editedEpic.description,
        startDate:   editedEpic.startDate,
        dueDate:     editedEpic.dueDate,
        priorityId:  editedEpic.priorityId,
        status:      editedEpic.status,
        userStories: editedEpic.userStories.map(us => us._id),
      };
      
      const success = await onSave({ _id: editedEpic._id, ...epicToSave });
      if (!success) {
        // Si el padre devolvió false o error, sólo salgo y muestro toast
        return;
      }
      onClose();
      toast.success('Épica actualizada correctamente');
        
    } catch (error) {
      console.error('Error guardando épica:', error);
      toast.error('Error guardando épica');
    }
  };

  const refreshEpicFromServer = async () => {
    try {
      const freshEpic = await EpicsService.getEpicById(epic._id);
      const filteredUserStories = await UserStoriesService.getUserStoriesByEpic(epic._id);
      
      const updatedEpic = {
        ...freshEpic,
        startDate: freshEpic.startDate ? parseDate(freshEpic.startDate) : null,
        dueDate: freshEpic.dueDate ? parseDate(freshEpic.dueDate) : null,
        endDate: freshEpic.endDate ? parseDate(freshEpic.endDate) : null,
        priorityId: freshEpic.priorityId?._id || freshEpic.priorityId || '',
        userStories: filteredUserStories,
      };
      
      setEditedEpic(updatedEpic);
      return updatedEpic;
      
    } catch (err) {
      console.error('Error refrescando épica:', err);
      toast.error('No se pudo recargar la épica');
      throw err;
    }
  };
  
  const handleSaveEpic = async () => {
    const success = await onSave({
      ...localEpic,
      userStories: userStories // Pasar HU actualizadas
    });
    
    if (success) onClose();
  };

  const updateUserStories = useCallback((stories) => {
    setEditedEpic(prev => ({ ...prev, userStories: stories }));
    // además informo al Kanban padre
    onUpdateUserStories?.(stories);
  }, [onUpdateUserStories]);

  

  

  // Helper para mostrar nombre de prioridad en vista no-edit
  const getEpicPriorityName = () => {
    if (!editedEpic.priorityId) return 'No definida';
    
    const priority = noMoscowPriorities.find(
      p => p._id === editedEpic.priorityId
    );
    
    return priority?.name || 'Desconocida';
  };

  const handleUserStoryUpdate = useCallback(async (newStories) => {
    // primero actualizo localmente
    updateUserStories(newStories);

    // luego re-fetch para asegurarme de leer los datos que quedaron realmente en BD
    try {
      const refreshed = await UserStoriesService.getUserStoriesByEpic(editedEpic._id);
      updateUserStories(refreshed);
    } catch (err) {
      console.error('Error recargando HUs completas:', err);
      toast.error('No se pudieron refrescar las historias');
    }
  }, [editedEpic._id, updateUserStories]);

  return (
    <div className={`rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg ${
      theme === 'dark'
        ? 'bg-zinc-800 text-white'
        : 'bg-white text-gray-800'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {editing ? 'Editando Épica' : 'Detalle de Épica'}
        </h2>
        <button
          onClick={onClose}
          className={`p-2 rounded-full hover:bg-opacity-20 ${
            theme === 'dark' ? 'hover:bg-white' : 'hover:bg-gray-200'
          }`}
        >
          ✕
        </button>
      </div>

      {editing ? (
        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Nombre*
            </label>
            <input
              className={`w-full p-2 rounded border ${
                theme === 'dark'
                  ? 'bg-zinc-700 border-zinc-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
              name="name"
              value={editedEpic.name || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          {/* Descripción */}
          <div>
            <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Descripción
            </label>
            <textarea
              className={`w-full p-2 rounded border ${
                theme === 'dark'
                  ? 'bg-zinc-700 border-zinc-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
              name="description"
              value={editedEpic.description || ''}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Fecha Inicio
              </label>
              <input
                className={`w-full p-2 rounded border ${
                  theme === 'dark'
                    ? 'bg-zinc-700 border-zinc-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
                type="date"
                name="startDate"
                // prellenar con parte YYYY-MM-DD
                value={editedEpic.startDate?.split('T')[0] || ''}
                onChange={handleInputChange}
                // Podemos usar min/max si quisiéramos validar rango de épica contra otras restricciones
              />
            </div>
            <div>
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Fecha Límite
              </label>
              <input
                className={`w-full p-2 rounded border ${
                  theme === 'dark'
                    ? 'bg-zinc-700 border-zinc-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
                type="date"
                name="dueDate"
                value={editedEpic.dueDate?.split('T')[0] || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          {/* Prioridad y estado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Prioridad
              </label>
              <select
                className={`w-full p-2 rounded border ${
                  theme === 'dark'
                    ? 'bg-zinc-700 border-zinc-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
                value={editedEpic.priorityId || ''}
                onChange={(e) => setEditedEpic(prev => ({
                  ...prev,
                  priorityId: e.target.value
                }))}
              >
                <option value="">Seleccionar prioridad</option>
                {isLoadingPriorities
                  ? <option disabled>Cargando...</option>
                  : noMoscowPriorities.map(priority => (
                    <option key={priority._id} value={priority._id}>
                      {priority.name}
                    </option>
                  ))
                }
              </select>
            </div>
            <div>
              <label className={`block mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Estado
              </label>
              <select
                className={`w-full p-2 rounded border ${
                  theme === 'dark'
                    ? 'bg-zinc-700 border-zinc-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
                name="status"
                value={editedEpic.status || 'Pendiente'}
                onChange={handleInputChange}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completado">Completado</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {editedEpic.name}
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {editedEpic.description || 'Sin descripción'}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Fecha Inicio:</span> {formatDateToUserTimezone(editedEpic.startDate)}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Fecha Fin:</span> {formatDateToUserTimezone(editedEpic.dueDate)}
              </p>
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Prioridad:</span> { getEpicPriorityName() || 'No definida' }
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Estado:</span> {editedEpic.status || 'Pendiente'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <UserStoryList
          userStories={editedEpic.userStories}
          epicToEdit={editedEpic}
          editing={editing}
          theme={theme}
          epicId={epic._id}
          onSavedOneStory={handleUserStoryUpdate}
        />


      </div>

      <div className="flex justify-end gap-3 mt-6">
        {editing ? (
          <>
            <button
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
              onClick={() => setEditing(false)}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              onClick={handleSave}
            >
              Guardar
            </button>
          </>
        ) : (
          <>
            <button
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
              onClick={onClose}
            >
              Cerrar
            </button>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              onClick={() => setEditing(true)}
            >
              Editar
            </button>
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              onClick={() => onDelete(epic._id)}
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EpicDetail;