// UserStoryManualForm.jsx
import { useState, useEffect } from 'react';
import PrioritiesService from '../../../api/services/prioritiesService';
import UsersService from '../../../api/services/usersService';

const formatToYYYYMMDD = (dateIsoOrDate) => {
  if (!dateIsoOrDate) return '';
  const date = typeof dateIsoOrDate === 'string' ? new Date(dateIsoOrDate) : dateIsoOrDate;
  return date.toISOString().split('T')[0];
};

const UserStoryManualForm = ({ story, epicId, epicStartDate, epicDueDate, onCancel, onSave, theme }) => {
  const isEditing = Boolean(story);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priorityId: '',
    startDate: '',
    dueDate: '',
    status: 'Pendiente',
    assignedTo: [],
    endDate: ''
  });
  const [prioritiesList, setPrioritiesList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Calcular rangos formateados
  const epicStartDateString = formatToYYYYMMDD(epicStartDate);
  const epicDueDateString = formatToYYYYMMDD(epicDueDate);

  useEffect(() => {
    // Pre-llenar si es edición
    if (isEditing && story) {
      setFormData({
        name: story.name || '',
        description: story.description || '',
        priorityId: typeof story.priorityId === 'object' ? story.priorityId._id : (story.priorityId || ''),
        startDate: story.startDate ? formatToYYYYMMDD(story.startDate) : '',
        dueDate: story.dueDate ? formatToYYYYMMDD(story.dueDate) : '',
        status: story.status || 'Pendiente',
        assignedTo: Array.isArray(story.assignedTo) ? story.assignedTo.map(id => typeof id === 'object' ? id._id : id) : [],
        endDate: story.endDate ? formatToYYYYMMDD(story.endDate) : ''
      });
    }
  }, [isEditing, story]);

  useEffect(() => {
    // Cargar prioridades y usuarios
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [prios, users] = await Promise.all([
          PrioritiesService.getMoscowPriorities(),
          UsersService.getAllUsers()
        ]);
        setPrioritiesList(prios || []);
        setUsersList(users || []);
      } catch (err) {
        console.error('Error cargando prioridades/usuarios en manual form:', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, selectedOptions, type } = e.target;
    if (name === 'assignedTo') {
      const values = Array.from(selectedOptions).map(opt => opt.value);
      setFormData(prev => ({ ...prev, assignedTo: values }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Si cambiamos status fuera de Completado, limpiar endDate
      if (name === 'status' && value !== 'Completado') {
        setFormData(prev => ({ ...prev, endDate: '' }));
      }
    }
  };

  const formatToISO = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toISOString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validaciones básicas
    if (!formData.name.trim() || !formData.description.trim() || !formData.priorityId) {
      return alert('Nombre, descripción y prioridad son requeridos.');
    }
    // Validar rango vs épica:
    // startDate >= epicStartDate
    if (formData.startDate) {
      if (epicStartDateString && formData.startDate < epicStartDateString) {
        return alert(`La fecha de inicio no puede ser anterior a la fecha de inicio de la épica (${epicStartDateString}).`);
      }
      if (epicDueDateString && formData.startDate > epicDueDateString) {
        return alert(`La fecha de inicio no puede ser posterior a la fecha límite de la épica (${epicDueDateString}).`);
      }
    }
    // dueDate entre epicStart y epicDue
    if (formData.dueDate) {
      if (formData.startDate && formData.dueDate < formData.startDate) {
        return alert('La fecha límite no puede ser anterior a la fecha de inicio.');
      }
      if (epicStartDateString && formData.dueDate < epicStartDateString) {
        return alert(`La fecha límite no puede ser anterior a la fecha de inicio de la épica (${epicStartDateString}).`);
      }
      if (epicDueDateString && formData.dueDate > epicDueDateString) {
        return alert(`La fecha límite no puede ser posterior a la fecha límite de la épica (${epicDueDateString}).`);
      }
    }
    // Si status = Completado, validar endDate
    if (formData.status === 'Completado') {
      if (!formData.endDate) return alert('Debe indicar fecha de finalización al marcar completada.');
      if (formData.startDate && formData.endDate < formData.startDate) {
        return alert('La fecha de finalización no puede ser anterior a la de inicio.');
      }
      if (epicStartDateString && formData.endDate < epicStartDateString) {
        return alert(`La fecha de finalización no puede ser anterior a la fecha de inicio de la épica (${epicStartDateString}).`);
      }
      if (epicDueDateString && formData.endDate > epicDueDateString) {
        return alert(`La fecha de finalización no puede ser posterior a la fecha límite de la épica (${epicDueDateString}).`);
      }
    }
    // assignedTo: opcional, validar si se requiere al menos uno. Aquí permitimos vacío.
    // Construir payload
    const payload = {
      ... (isEditing && { _id: story._id }),
      name: formData.name.trim(),
      description: formData.description.trim(),
      priorityId: formData.priorityId || null,
      epicId,
      status: formData.status,
      assignedTo: formData.assignedTo,
      startDate: formatToISO(formData.startDate),
      dueDate: formatToISO(formData.dueDate),
      endDate: formData.status === 'Completado' && formData.endDate
        ? formatToISO(formData.endDate)
        : undefined
    };
    onSave(payload, isEditing);
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-white text-gray-800'}`}>
      <h4 className="font-semibold">{isEditing ? 'Editar Historia de Usuario' : 'Nueva Historia de Usuario'}</h4>
      {/* Nombre */}
      <div>
        <label className="block mb-1">Nombre*</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
          required
        />
      </div>
      {/* Descripción */}
      <div>
        <label className="block mb-1">Descripción*</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
          required
        />
      </div>
      {/* Prioridad */}
      <div>
        <label className="block mb-1">Prioridad*</label>
        <select
          name="priorityId"
          value={formData.priorityId}
          onChange={handleChange}
          className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
          required
        >
          <option value="">Seleccionar prioridad</option>
          {prioritiesList.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>
      {/* Fechas y estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1">Fecha de Inicio</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            min={epicStartDateString || undefined}
            max={epicDueDateString || undefined}
            className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
          />
        </div>
        <div>
          <label className="block mb-1">Fecha Límite</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            min={formData.startDate || epicStartDateString || undefined}
            max={epicDueDateString || undefined}
            className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
          />
        </div>
        <div>
          <label className="block mb-1">Estado</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En Progreso">En Progreso</option>
            <option value="Completado">Completado</option>
          </select>
        </div>
      </div>
      {formData.status === 'Completado' && (
        <div>
          <label className="block mb-1">Fecha de Finalización*</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            min={formData.startDate || epicStartDateString || undefined}
            max={epicDueDateString || undefined}
            className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
            required
          />
        </div>
      )}
      {/* Asignación multiple */}
      <div>
        <label className="block mb-1">Asignar a</label>
        <select
          name="assignedTo"
          multiple
          value={formData.assignedTo}
          onChange={handleChange}
          className={`w-full px-3 py-2 rounded border ${theme === 'dark' ? 'bg-zinc-700 text-white border-zinc-600' : 'border-gray-300'}`}
        >
          {usersList.map(user => (
            <option key={user._id} value={user._id}>{user.name}</option>
          ))}
        </select>
        <p className="text-sm text-gray-500">Mantén pulsado Ctrl/Cmd para seleccionar varios.</p>
      </div>
      {/* Botones */}
      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-gray-800">
          Cancelar
        </button>
        <button type="submit" className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white">
          {isEditing ? 'Guardar cambios' : 'Crear Historia'}
        </button>
      </div>
    </form>
  );
};

export default UserStoryManualForm;
