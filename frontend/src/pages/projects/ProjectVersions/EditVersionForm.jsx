import { useState, useEffect } from 'react';

const EditVersionForm = ({ theme, version, onSave, onCancel, projectMembers, allMembers }) => {
  // Función para calcular el progreso inicial
  const calculateInitialProgress = (version) => {
    const tasks = version.tasks || version.releaseNotes || [];
    const totalTasks = tasks.length;
    const completedTasks = version.completedTasks || 0;
    return {
      progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalTasks,
      completedTasks: Math.min(completedTasks, totalTasks)
    };
  };

  // Inicializar con los valores de la versión
  const [editedVersion, setEditedVersion] = useState({
    version: version.version || '',
    status: version.status || 'Planificado',
    startDate: version.startDate || '',
    endDate: version.endDate || '',
    description: version.description || '',
    tasks: version.tasks || version.releaseNotes || [],
    assignedMembers: version.assignedMembers || [],
    ...calculateInitialProgress(version)
  });

  const [newTask, setNewTask] = useState('');
  const [versionError, setVersionError] = useState('');
  const [availableMembers, setAvailableMembers] = useState([]);

  useEffect(() => {
    const currentAssignedMembers = editedVersion.assignedMembers || [];
    setAvailableMembers(
      allMembers.filter(member => 
        !currentAssignedMembers.some(am => am.userId === member.userId)
      )
    );
  }, [allMembers, editedVersion.assignedMembers]);

  // Actualizar progreso cuando cambian las tareas o tareas completadas
  useEffect(() => {
    const totalTasks = editedVersion.tasks.length;
    const completedTasks = Math.min(editedVersion.completedTasks, totalTasks);
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    setEditedVersion(prev => ({
      ...prev,
      totalTasks,
      completedTasks,
      progress
    }));
  }, [editedVersion.tasks, editedVersion.completedTasks]);

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
    
    setEditedVersion(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      setEditedVersion(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask.trim()],
        totalTasks: prev.tasks.length + 1
      }));
      setNewTask('');
    }
  };

  const handleRemoveTask = (index) => {
    setEditedVersion(prev => {
      const newTasks = prev.tasks.filter((_, i) => i !== index);
      const newCompleted = Math.min(prev.completedTasks, newTasks.length);
      return {
        ...prev,
        tasks: newTasks,
        totalTasks: newTasks.length,
        completedTasks: newCompleted
      };
    });
  };

  const handleTaskChange = (e, index) => {
    const updatedTasks = [...editedVersion.tasks];
    updatedTasks[index] = e.target.value;
    setEditedVersion(prev => ({ ...prev, tasks: updatedTasks }));
  };

  const handleAddMember = (member) => {
    setEditedVersion(prev => ({
      ...prev,
      assignedMembers: [...prev.assignedMembers, member]
    }));
  };

  const handleRemoveMember = (memberId) => {
    setEditedVersion(prev => ({
      ...prev,
      assignedMembers: prev.assignedMembers.filter(m => m.userId !== memberId)
    }));
  };

  const handleProgressChange = (e) => {
    const progress = parseInt(e.target.value) || 0;
    const completedTasks = Math.round((progress / 100) * editedVersion.tasks.length);
    
    setEditedVersion(prev => ({
      ...prev,
      progress,
      completedTasks
    }));
  };

  const handleCompletedTasksChange = (e) => {
    const completedTasks = parseInt(e.target.value) || 0;
    const totalTasks = editedVersion.tasks.length;
    const validCompletedTasks = Math.min(completedTasks, totalTasks);
    
    setEditedVersion(prev => ({
      ...prev,
      completedTasks: validCompletedTasks,
      progress: totalTasks > 0 ? Math.round((validCompletedTasks / totalTasks) * 100) : 0
    }));
  };

  const handleSubmit = () => {
    if (!validateVersionFormat(editedVersion.version)) {
      setVersionError('El formato de versión es requerido (vX.X.X)');
      return;
    }
    onSave({
      ...editedVersion,
      releaseNotes: editedVersion.tasks // Mantener compatibilidad
    });
  };

  return (
    <>
      <div className={`fixed inset-0 z-40 backdrop-blur-sm ${theme === 'dark' ? 'bg-black/50' : 'bg-gray-500/50'}`}></div>
      
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4`}>
        <div className={`rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
          theme === 'dark' ? 'bg-zinc-900' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Editar Versión {editedVersion.version}
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
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Número de versión* (Formato: vX.X.X)
                </label>
                <input
                  type="text"
                  name="version"
                  value={editedVersion.version}
                  onChange={handleInputChange}
                  required
                  placeholder="Ejemplo: v1.0.0"
                  className={`w-full px-3 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                  } border ${versionError ? 'border-red-500' : ''}`}
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
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={editedVersion.description}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-3 py-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                  } border`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={editedVersion.startDate}
                    onChange={handleInputChange}
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
                    value={editedVersion.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } border`}
                  />
                </div>
              </div>
            </div>

            {/* Columna derecha - Miembros, progreso y tareas */}
            <div className="space-y-4">
              {/* Sección de progreso */}
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
                    Tareas completadas
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={editedVersion.tasks.length}
                    value={editedVersion.completedTasks}
                    onChange={handleCompletedTasksChange}
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
                    value={editedVersion.tasks.length}
                    readOnly
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } border opacity-50 cursor-not-allowed`}
                  />
                </div>
              </div>

              {/* Sección de miembros asignados */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Miembros asignados
                </label>
                <div className="space-y-2">
                  {editedVersion.assignedMembers.map(member => (
                    <div key={member.userId} className={`flex items-center justify-between p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
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
                          if (selectedMember) handleAddMember(selectedMember);
                        }}
                        className={`w-full px-3 py-2 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                        } border`}
                        value=""
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

              {/* Sección de tareas */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tareas ({editedVersion.tasks.length})
                </label>
                <div className="space-y-2">
                  {editedVersion.tasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={task}
                        onChange={(e) => handleTaskChange(e, index)}
                        className={`flex-1 px-3 py-2 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                        } border`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(index)}
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
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="Nueva tarea..."
                      className={`flex-1 px-3 py-2 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                      } border`}
                    />
                    <button
                      type="button"
                      onClick={handleAddTask}
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
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditVersionForm;