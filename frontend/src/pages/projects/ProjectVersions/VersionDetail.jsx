const VersionDetails = ({ version, theme, issues = [], onClose, projectManager, projectMembers = [], onEdit }) => {
  if (!version) {
    return (
      <div className={`
        rounded-xl p-6 mt-6
        ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white border border-gray-200'}
      `}>
        <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No se ha seleccionado ninguna versión
        </p>
      </div>
    );
  }

  const userStories = version.userStories || [];
  const completedUserStories = userStories.filter(
    story => story.status === 'Completado' || story.completed
  ).length;
  const totalUserStories = userStories.length;
  const progressPercentage = totalUserStories > 0
    ? Math.round((completedUserStories / totalUserStories) * 100)
    : 0;

  const managerUser = projectMembers.find(u => u._id === version.authorUserId);
  const versionManagerName = managerUser?.name || projectManager || 'No asignado';  

  return (
    <div className={`rounded-xl p-6 mt-6 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Versión {version.name || 'Sin versión'}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manager del proyecto: {versionManagerName}
          </p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className={`px-3 py-1 rounded-lg text-sm ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              Editar
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-6">
          <div>
            <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Información general
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Estado</p>
                <p className={`inline-block px-2 py-1 rounded text-sm ${version.status === 'Completado' ?
                  theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800' :
                  version.status === 'En Progreso' ?
                  theme === 'dark' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-800' :
                  version.status === 'Planificado' ?
                  theme === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-800' :
                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                  {version.status || 'No especificado'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Descripción</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {version.description || 'No hay descripción disponible'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Fecha inicio</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {version.startDate ? new Date(version.startDate).toLocaleDateString() : 'No definida'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha fin</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {version.releaseDate ? new Date(version.releaseDate).toLocaleDateString() : 'No definida'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Equipo asignado
            </h4>
            <div className="space-y-2">
              {version.assignedTeam && version.assignedTeam.length > 0 ? (
                version.assignedTeam.map(member => (
                  <div key={member._id || member.userId} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'}`} />
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {member.name} – <span className="text-gray-500">{member.role}</span>
                    </p>
                  </div>
                ))
              ) : (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay miembros asignados a esta versión.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          <div>
            <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Progreso
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Completado: {progressPercentage}%
                  </span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {completedUserStories} de {totalUserStories} historias
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full rounded-full ${
                      progressPercentage < 30 ? 'bg-red-500' :
                      progressPercentage < 70 ? 'bg-yellow-500' :
                      progressPercentage < 100 ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

<div>
  <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
    Historias de Usuario
  </h4>
  {userStories.length === 0 ? (
    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
      No hay historias de usuario definidas para esta versión.
    </p>
  ) : (
    <div className="space-y-3">
      {userStories.map((story, index) => (
        <div
          key={story._id || story.id || index}
          className={`p-3 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex justify-between items-center">
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {story.name || `Historia ${index + 1}`}
            </p>
            <span className={`px-2 py-1 rounded text-xs ${
              story.status === 'Completado' || story.completed
                ? theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800'
                : story.status === 'En progreso'
                  ? theme === 'dark' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                  : theme === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-800'
            }`}>
              {story.status || (story.completed ? 'Completado' : 'Pendiente')}
            </span>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
        </div>
      </div>
    </div>
  );
};

export default VersionDetails;
