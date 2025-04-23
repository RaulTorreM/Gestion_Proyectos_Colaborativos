const ProjectStats = ({ 
  progress, 
  completedTasks, 
  totalTasks, 
  startDate, 
  endDate, 
  duration,
  members,
  progressColor // Nuevo prop
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Tarjeta de Progreso */}
      <div className="bg-black-800 p-4 rounded-lg border border-gray-700 shadow-md">
        <h3 className="font-semibold text-white mb-2">Progreso</h3>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className={`${progressColor} h-2 rounded-full`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-400">{progress}% completado</p>
        <p className="text-sm text-gray-400">{completedTasks}/{totalTasks} userStories</p>
      </div>
      
      {/* Tarjeta de Fechas */}
      <div className="bg-black-800 p-4 rounded-lg border border-gray-700 shadow-md">
        <h3 className="font-semibold text-white mb-2">Fechas</h3>
        <div className="space-y-1">
          <p className="text-sm text-gray-400"><span className="font-medium text-white">Inicio:</span> {new Date(startDate).toLocaleDateString()}</p>
          <p className="text-sm text-gray-400"><span className="font-medium text-white">Fin:</span> {new Date(endDate).toLocaleDateString()}</p>
          <p className="text-sm text-gray-400"><span className="font-medium text-white">Duración:</span> {duration} días</p>
        </div>
      </div>
      
      {/* Tarjeta de Miembros */}
      <div className="bg-black-800 p-4 rounded-lg border border-gray-700 shadow-md">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-white">Miembros</h3>
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Editar
          </button>
        </div>
        <div className="space-y-2">
          {members.map(user => (
            <div key={user._id} className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-600 mr-2 flex items-center justify-center text-xs font-bold text-white">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.role || 'Miembro'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectStats;
