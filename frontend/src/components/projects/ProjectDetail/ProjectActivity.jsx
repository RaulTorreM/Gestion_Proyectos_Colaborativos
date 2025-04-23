const ProjectActivity = ({ activities, timeEntries, comments }) => {
  const timeActivities = Array.isArray(timeEntries)
    ? timeEntries.map(te => ({
        type: 'timeEntry',
        user: te.userId,
        action: 'registró tiempo en',
        task: te.description,
        time: te.createdAt
      }))
    : [];

  const commentActivities = Array.isArray(comments)
    ? comments.map(c => ({
        type: 'comment',
        user: c.userId,
        action: 'comentó en',
        task: c.text,
        time: c.createdAt
      }))
    : [];

  const allActivities = [
    ...(activities || []),
    ...timeActivities,
    ...commentActivities
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <div className="bg-black min-h-screen-800 p-4 rounded-lg border border-gray-700">
      <h3 className="font-semibold text-white mb-3">Actividad Reciente</h3>
      <p className="text-sm text-gray-400 mb-4">Últimas actualizaciones del proyecto</p>

      <div className="space-y-4">
        {allActivities.slice(0, 5).map((activity, index) => (
          <div key={index} className="flex items-start">
            <div className="w-8 h-8 rounded-full bg-gray-600 mr-3 flex items-center justify-center text-xs text-white">
              {activity.user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{activity.user?.name || 'Usuario'}</p>
              <p className="text-sm text-gray-400">
                {activity.action} <span className="font-medium">{activity.task}</span>
              </p>
              <p className="text-xs text-gray-500">
                {new Date(activity.time).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <textarea 
          className="w-full p-2 border border-gray-700 bg-black-900 rounded text-sm text-white"
          placeholder="Añadir comentario..."
          rows="2"
        ></textarea>
        <button className="mt-2 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
          Comentar
        </button>
      </div>
    </div>
  );
};

export default ProjectActivity;