const KanbanTask = ({ task, theme, onDragStart, onClick, getPriorityColor }) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={() => onClick(task)}
      className={`p-3 rounded-lg shadow-sm cursor-pointer transition-colors mb-2 ${theme === 'dark' ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-white hover:bg-gray-50'}`}
    >
      <div className={`text-xs ${getPriorityColor(task.priority)} text-white py-1 px-2 rounded-md inline-block mb-2`}>
        {task.priority?.name || task.priority || 'Sin prioridad'}
      </div>
      
      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        {task.name || task.title}
      </h3>
      
      {task.description && (
        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {task.description.length > 60 ? `${task.description.substring(0, 60)}...` : task.description}
        </p>
      )}
      
      <div className="mt-3 flex justify-between items-center text-xs">
        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {task.startDate} - {task.endDate}
        </span>
        <span className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-zinc-600 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
          {task.userStories?.length || 0} US
        </span>
      </div>
    </div>
  );
};

export default KanbanTask;