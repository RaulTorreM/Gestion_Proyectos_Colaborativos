import { useState, useEffect } from 'react';
import UsersService from '../../../api/services/usersService';

const EditVersionForm = ({ theme, version, onSave, onCancel, projectMembers }) => {
  const calculateInitialProgress = (version) => {
    const userStories = version.userStories || [];
    const totalStories = userStories.length;
    const completedStories = version.completedStories || 0;
    return {
      progress: totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0,
      totalStories,
      completedStories: Math.min(completedStories, totalStories)
    };
  };

  const [editedVersion, setEditedVersion] = useState({
    name: version.name || '',
    status: version.status || 'Planeado',
    startDate: version.startDate?.substring(0, 10) || '',
    releaseDate: version.releaseDate?.substring(0, 10) || '',
    description: version.description || '',
    userStories: (version.userStories || []).map(story => story._id || story), 
    ...calculateInitialProgress(version)
  });

  const [versionError, setVersionError] = useState('');
  const [errors, setErrors] = useState([]);





  useEffect(() => {
    const totalStories = editedVersion.userStories.length;
    const completedStories = Math.min(editedVersion.completedStories, totalStories);
    const progress = totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0;

    setEditedVersion(prev => ({
      ...prev,
      totalStories,
      completedStories,
      progress
    }));
  }, [editedVersion.userStories, editedVersion.completedStories]);

  const validateVersionFormat = (versionName) => {
    const versionRegex = /^v\d+\.\d+\.\d+$/;
    return versionRegex.test(versionName);
  };

  const validateForm = () => {
    const newErrors = [];

    if (!editedVersion.name.trim()) {
      newErrors.push({ msg: 'El nombre de la versión es obligatorio' });
    }

    if (!editedVersion.description.trim()) {
      newErrors.push({ msg: 'La descripción es obligatoria' });
    }

    if (!editedVersion.startDate) {
      newErrors.push({ msg: 'La fecha de inicio es obligatoria' });
    }

    if (editedVersion.releaseDate && new Date(editedVersion.releaseDate) < new Date(editedVersion.startDate)) {
      newErrors.push({ msg: 'La fecha de lanzamiento no puede ser anterior a la fecha de inicio' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name') {
      if (!validateVersionFormat(value) && value !== '') {
        setVersionError('El formato debe ser vX.X.X (ejemplo: v1.0.0)');
      } else {
        setVersionError('');
      }
    }

    setEditedVersion(prev => ({ ...prev, [name]: value }));
  };





  const handleProgressChange = (e) => {
    const progress = parseInt(e.target.value) || 0;
    const completedStories = Math.round((progress / 100) * editedVersion.userStories.length);

    setEditedVersion(prev => ({
      ...prev,
      progress,
      completedStories
    }));
  };

  const handleCompletedStoriesChange = (e) => {
    const completedStories = parseInt(e.target.value) || 0;
    const totalStories = editedVersion.userStories.length;
    const validCompletedStories = Math.min(completedStories, totalStories);

    setEditedVersion(prev => ({
      ...prev,
      completedStories: validCompletedStories,
      progress: totalStories > 0 ? Math.round((validCompletedStories / totalStories) * 100) : 0
    }));
  };

  const handleSubmit = () => {
    setErrors([]);

    if (!validateVersionFormat(editedVersion.name)) {
      setVersionError('El formato de versión es requerido (vX.X.X)');
      return;
    }

    if (!validateForm()) {
      return;
    }

    const versionData = {
      name: editedVersion.name.trim(),
      status: editedVersion.status,
      description: editedVersion.description.trim(),
      startDate: new Date(editedVersion.startDate),
      releaseDate: editedVersion.releaseDate ? new Date(editedVersion.releaseDate) : null,
      progress: editedVersion.progress,
      userStories: editedVersion.userStories, // solo IDs
      completedStories: editedVersion.completedStories
    };
    

    onSave(versionData);
  };



  const inputClass = `w-full px-3 py-2 border rounded-lg ${
    theme === 'dark' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-800 border-gray-300'
  }`;

  return (
    <>
      <div className={`fixed inset-0 z-40 backdrop-blur-sm ${theme === 'dark' ? 'bg-black/50' : 'bg-gray-500/50'}`}></div>
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4`}>
        <div className={`rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
          theme === 'dark' ? 'bg-zinc-900' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Editar Versión {editedVersion.name}
            </h2>
            <button onClick={onCancel} className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {errors.map((e, i) => <div key={i}>• {e.msg}</div>)}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Número de versión* (Formato: vX.X.X)
                </label>
                <input
                  type="text"
                  name="name"
                  value={editedVersion.name}
                  onChange={handleInputChange}
                  placeholder="Ejemplo: v1.0.0"
                  className={`${inputClass} ${versionError ? 'border-red-500' : ''}`}
                />
                {versionError && <p className="text-xs text-red-500 mt-1">{versionError}</p>}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Estado
                </label>
                <select
                  name="status"
                  value={editedVersion.status}
                  onChange={handleInputChange}
                  className={inputClass}
                >
                  <option value="Planeado">Planificado</option>
                  <option value="En Progreso">En progreso</option>
                  <option value="Lanzado">Lanzado</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Descripción*
                </label>
                <textarea
                  name="description"
                  value={editedVersion.description}
                  onChange={handleInputChange}
                  rows="3"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha de inicio*
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={editedVersion.startDate}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha de lanzamiento
                  </label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={editedVersion.releaseDate}
                    onChange={handleInputChange}
                    className={inputClass}
                    min={editedVersion.startDate}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Progreso: {editedVersion.progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editedVersion.progress}
                  onChange={handleProgressChange}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                    theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Historias completadas
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={editedVersion.userStories.length}
                    value={editedVersion.completedStories}
                    onChange={handleCompletedStoriesChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Total de historias
                  </label>
                  <input
                    type="number"
                    value={editedVersion.userStories.length}
                    readOnly
                    className={`${inputClass} opacity-50 cursor-not-allowed`}
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onCancel}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={versionError || errors.length > 0 }
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
              } ${(versionError || errors.length > 0 ) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditVersionForm;