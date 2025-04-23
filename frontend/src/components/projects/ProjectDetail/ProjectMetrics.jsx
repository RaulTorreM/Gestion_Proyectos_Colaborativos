const ProjectMetrics = ({ epics, userStories }) => {
    // Datos de ejemplo basados en el diagrama
    const metrics = {
      epicsCompleted: epics?.filter(e => e.status === 'completed').length || 0,
      totalEpics: epics?.length || 0,
      storiesCompleted: userStories?.filter(us => us.status === 'completed').length || 0,
      totalStories: userStories?.length || 0,
      avgTime: 3.2 // días por userStory 
    };
  
    return (
      <div className="bg-black-800 p-4 rounded-lg border border-gray-700">
        <h3 className="font-semibold text-white mb-3">Métricas del Proyecto</h3>
        <p className="text-sm text-gray-400 mb-4">Indicadores clave de rendimiento</p>
        
        <div className="grid grid-cols-2 gap-4">
        <div className="bg-black-700 p-3 rounded border-2 border-gray-600">
            <p className="text-xs text-gray-400">Epics</p>
            <p className="text-xl font-bold text-white">
              {metrics.epicsCompleted}/{metrics.totalEpics}
            </p>
            <p className="text-xs text-gray-400">completadas</p>
          </div>
          
          <div className="bg-black-700 p-3 rounded border-2 border-gray-600">
            <p className="text-xs text-gray-400">User Stories</p>
            <p className="text-xl font-bold text-white">
              {metrics.storiesCompleted}/{metrics.totalStories}
            </p>
            <p className="text-xs text-gray-400">completadas</p>
          </div>
          
          <div className="bg-black-700 p-3 rounded border-2 border-gray-600">
            <p className="text-xs text-gray-400">Tiempo promedio</p>
            <p className="text-xl font-bold text-white">{metrics.avgTime}</p>
            <p className="text-xs text-gray-400">días por story</p>
          </div>
          
          <div className="bg-black-700 p-3 rounded border-2 border-gray-600">
            <p className="text-xs text-gray-400">Versiones</p>
            <p className="text-xl font-bold text-white">2</p>
            <p className="text-xs text-gray-400">activas</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default ProjectMetrics;