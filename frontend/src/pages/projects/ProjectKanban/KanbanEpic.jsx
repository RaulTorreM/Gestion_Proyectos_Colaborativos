const formatDateToUserTimezone = (dateIsoString, timezone) => {
  if (!dateIsoString) return 'N/A';
  const date = new Date(dateIsoString);
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const KanbanEpic = ({ epic, theme, onDragStart, onClick, loggedUser }) => {
  // Determinar la prioridad para mostrar y para el color
  const priorityName = epic.priorityId.name || epic.priorityName || 'Sin prioridad';
  const priorityColor = epic.priorityId.color || epic.priorityId.color || epic.priorityColor;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={() => onClick(epic)}
      className={`p-3 rounded-lg shadow-sm cursor-pointer transition-colors mb-2 ${
        theme === 'dark' ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div style={{ backgroundColor: priorityColor || '#999' }} className={`text-xs text-white py-1 px-2 rounded-md inline-block mb-2`}>
        {priorityName}
      </div>
      
      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        {epic.name || epic.title}
      </h3>
      
      {epic.description && (
        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {epic.description.length > 60 ? `${epic.description.substring(0, 60)}...` : epic.description}
        </p>
      )}
      
      <div className="mt-3 flex justify-between items-center text-xs">
        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {formatDateToUserTimezone(epic.startDate, loggedUser.preferences.timezone)} - {formatDateToUserTimezone(epic.endDate, loggedUser.preferences.timezone)}
        </span>

        <span className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-zinc-600 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
          {epic.userStories?.length || 0} US
        </span>
      </div>
    </div>
  );
};

export default KanbanEpic;