// src/pages/projects/ProjectVersions/AddVersionForm.jsx
import { useState, useEffect } from 'react';

const AddVersionForm = ({ theme, onSave, onCancel, projectMembers, allMembers }) => {
  const [newVersion, setNewVersion] = useState({
    version: '',
    status: 'Planificado',
    startDate: '',
    endDate: '',
    description: '',
    progress: 0,
    completedTasks: 0,
    totalTasks: 0,
    releaseNotes: [''],
    assignedMembers: []
  });

  const [newNote, setNewNote] = useState('');
  const [versionError, setVersionError] = useState('');
  const [availableMembers, setAvailableMembers] = useState([]);

  useEffect(() => {
    // Filtrar miembros disponibles (todos los miembros menos los ya asignados)
    setAvailableMembers(allMembers.filter(member => 
      !newVersion.assignedMembers.some(am => am.userId === member.userId)
    ));
  }, [allMembers, newVersion.assignedMembers]);

  const validateVersionFormat = (version) => {
    const versionRegex = /^v\d+\.\d+\.\d+$/;
    return versionRegex.test(version);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'version') {
      if (!validateVersionFormat(value) && value !== '') {
        setVersionError('El formato debe ser vX.X.X (ejemplo: v1.0.0)');
      } else {
        setVersionError('');
      }
    }
    
    setNewVersion(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNewVersion(prev => ({
        ...prev,
        releaseNotes: [...prev.releaseNotes, newNote.trim()]
      }));
      setNewNote('');
    }
  };

  const handleRemoveNote = (index) => {
    setNewVersion(prev => ({
      ...prev,
      releaseNotes: prev.releaseNotes.filter((_, i) => i !== index)
    }));
  };

  const handleNoteChange = (e, index) => {
    const updatedNotes = [...newVersion.releaseNotes];
    updatedNotes[index] = e.target.value;
    setNewVersion(prev => ({ ...prev, releaseNotes: updatedNotes }));
  };

  const handleAddMember = (member) => {
    setNewVersion(prev => ({
      ...prev,
      assignedMembers: [...prev.assignedMembers, member]
    }));
  };

  const handleRemoveMember = (memberId) => {
    setNewVersion(prev => ({
      ...prev,
      assignedMembers: prev.assignedMembers.filter(m => m.userId !== memberId)
    }));
  };

  const handleSubmit = () => {
    if (!validateVersionFormat(newVersion.version)) {
      setVersionError('El formato de versión es requerido (vX.X.X)');
      return;
    }
    onSave(newVersion);
  };

  return (
    <>
      {/* Fondo con blur */}
      <div className={`fixed inset-0 z-40 backdrop-blur-sm ${theme === 'dark' ? 'bg-black/50' : 'bg-gray-500/50'}`}></div>
      
      {/* Formulario modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4`}>
        <div className={`rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
          theme === 'dark' ? 'bg-zinc-900' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Agregar Nueva Versión
            </h2>
            <button
              onClick={onCancel}
              className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda - Información básica */}
            <div className="space-y-4">
              {/* Solo queda el campo de número de versión */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Número de versión* (Formato: vX.X.X)
                </label>
                <input
                  type="text"
                  name="version"
                  value={newVersion.version}
                  onChange={handleInputChange}
                  required
                  placeholder="Ejemplo: v1.0.0"
                  className={`w-full px-3 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                  } border ${versionError ? 'border-red-500' : ''}`}
                />
                {versionError && (
                  <p className="text-xs text-red-500 mt-1">{versionError}</p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Estado*
                </label>
                <select
                  name="status"
                  value={newVersion.status}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                  } border`}
                >
                  {['Planificado', 'En progreso', 'Completado'].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Descripción*
                </label>
                <textarea
                  name="description"
                  value={newVersion.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  className={`w-full px-3 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                  } border`}
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
                    value={newVersion.startDate}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } border`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha de fin
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={newVersion.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } border`}
                  />
                </div>
              </div>
            </div>

            {/* Columna derecha - Progreso, miembros y notas */}
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Progreso (%)
                </label>
                <input
                  type="number"
                  name="progress"
                  min="0"
                  max="100"
                  value={newVersion.progress}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                  } border`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tareas completadas
                  </label>
                  <input
                    type="number"
                    name="completedTasks"
                    min="0"
                    value={newVersion.completedTasks}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } border`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Total de tareas
                  </label>
                  <input
                    type="number"
                    name="totalTasks"
                    min="0"
                    value={newVersion.totalTasks}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } border`}
                  />
                </div>
              </div>

              {/* Asignación de miembros */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Miembros asignados
                </label>
                <div className="space-y-2">
                  {newVersion.assignedMembers.map(member => (
                    <div key={member.userId} className="flex items-center justify-between p-2 rounded-lg bg-opacity-50 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {member.name} - {member.role}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.userId)}
                        className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {availableMembers.length > 0 && (
                    <div className="relative">
                <select
                    onChange={(e) => {
                    const selectedMember = availableMembers.find(m => m.userId === e.target.value);
                    if (selectedMember) {
                        handleAddMember(selectedMember);
                    }
                    }}
                    className={`w-full px-3 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } border`}
                    value="" // Esto evita que se quede seleccionado un valor
                >
                    <option value="">Seleccionar miembro...</option>
                    {availableMembers.map(member => (
                    <option key={member.userId} value={member.userId}>
                        {member.name} ({member.role})
                    </option>
                    ))}
                </select>
                </div>
                  )}
                </div>
              </div>

              {/* Release Notes */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tareas de la versión
                </label>
                <div className="space-y-2">
                  {newVersion.releaseNotes.map((note, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => handleNoteChange(e, index)}
                        className={`flex-1 px-3 py-2 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                        } border`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNote(index)}
                        className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Nueva tarea..."
                      className={`flex-1 px-3 py-2 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                      } border`}
                    />
                    <button
                      type="button"
                      onClick={handleAddNote}
                      className={`px-3 py-2 rounded-lg ${
                        theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Agregar
                    </button>
                  </div>
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
              disabled={versionError}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
              } ${versionError ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Guardar Versión
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddVersionForm;