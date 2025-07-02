import { useState, useEffect } from 'react';
import UsersService from '../../../api/services/usersService';
import VersionsService from '../../../api/services/versionsService';
import UserStoriesService from '../../../api/services/userStoriesService';
import ProjectsService from '../../../api/services/projectsService';

const AddVersionForm = ({ theme, onSave, onCancel, projectId }) => {
  const [formData, setFormData] = useState({
    versionName: '',
    status: 'Planeado',
    description: '',
    startDate: '',
    releaseDate: '',
    progress: 0,
    userStories: [],
  });

  const [projectStartDate, setProjectStartDate] = useState(null);
  const [projectEndDate, setProjectEndDate] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectUserStories, setProjectUserStories] = useState([]);

  useEffect(() => {
    const fetchStories = async () => {
      const allStories = await UserStoriesService.getUserStoriesByProject(projectId);
      setProjectUserStories(allStories.filter(story => !story.deletedAt));
    };
    fetchStories();
  }, [projectId]);
  

  useEffect(() => {
    const fetchData = async () => {
      try {


        const project = await ProjectsService.getProjectById(projectId);
        if (project) {
          setProjectStartDate(project?.startDate?.slice(0, 10));
          setProjectEndDate(project?.endDate?.slice(0, 10));
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setErrors([{ msg: 'Error al cargar datos iniciales' }]);
      }
    };
    fetchData();
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };




  const validateForm = () => {
    const newErrors = [];

    if (!formData.versionName.trim()) {
      newErrors.push({ msg: 'El nombre de la versión es obligatorio' });
    }

    if (!formData.description.trim()) {
      newErrors.push({ msg: 'La descripción es obligatoria' });
    }

    if (!formData.startDate) {
      newErrors.push({ msg: 'La fecha de inicio es obligatoria' });
    } else if (projectStartDate && new Date(formData.startDate) < new Date(projectStartDate)) {
      newErrors.push({ msg: 'La fecha de inicio no puede ser anterior a la fecha de inicio del proyecto' });
    }

    if (formData.releaseDate && projectEndDate && new Date(formData.releaseDate) > new Date(projectEndDate)) {
      newErrors.push({ msg: 'La fecha de lanzamiento no puede ser posterior a la fecha de fin del proyecto' });
    }

    if (formData.releaseDate && new Date(formData.releaseDate) < new Date(formData.startDate)) {
      newErrors.push({ msg: 'La fecha de lanzamiento no puede ser anterior a la fecha de inicio' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const newVersionPayload = {
        name: formData.versionName,
        status: formData.status,
        description: formData.description,
        startDate: formData.startDate,
        releaseDate: formData.releaseDate || null,
        progress: formData.progress,
        projectId,
        userStories: formData.userStories // Vacío, hasta que se elijan desde épicas
      };

      const version = await VersionsService.createVersion(newVersionPayload);

      for (const storyId of formData.userStories) {
        try {
          await UserStoriesService.updateUserStory(storyId, { versionId: version._id });
        } catch (err) {
          console.warn(`No se pudo actualizar la historia ${storyId}:`, err);
        }
      }
      

      if (!version || !version._id) {
        throw new Error('La versión creada no tiene un ID válido');
      }

      onSave(version);

    } catch (error) {
      console.error('Error al guardar versión:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.message) {
        setErrors([{ msg: error.message }]);
      } else {
        setErrors([{ msg: 'Error inesperado al guardar la versión.' }]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full px-3 py-2 border rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-white border-zinc-700' : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className={`rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-zinc-900 text-white' : 'bg-white border border-gray-200'}`}>
        <h2 className="text-xl font-bold mb-4">Agregar nueva versión</h2>

        {errors.length > 0 && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {errors.map((e, i) => <div key={i}>• {e.msg}</div>)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Número de versión *</label>
              <input
                type="text"
                name="versionName"
                value={formData.versionName}
                onChange={handleChange}
                placeholder="v1.0.0"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Estado</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                <option value="Planeado">Planificado</option>
                <option value="En Progreso">En progreso</option>
                <option value="Lanzado">Lanzado</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Fecha de inicio *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={inputClass}
                min={projectStartDate}
                required
              />
              {projectStartDate && <p className="text-xs text-gray-500 mt-1">Mínimo permitido: {projectStartDate}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Fecha de lanzamiento</label>
              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                className={inputClass}
                min={formData.startDate || projectStartDate}
                max={projectEndDate}
              />
              {projectEndDate && <p className="text-xs text-gray-500 mt-1">Máximo permitido: {projectEndDate}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Descripción *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Miembros asignados</h3>
            
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Historias de Usuario</h3>
              <select
                multiple
                name="userStories"
                value={formData.userStories}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    userStories: Array.from(e.target.selectedOptions, (opt) => opt.value),
                  }))
                }
                className={inputClass + ' h-40'}
              >
                {projectUserStories.map((story) => (
                  <option key={story._id} value={story._id}>
                    {story.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-black"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVersionForm;
