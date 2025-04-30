const KanbanTask = ({ task, theme, onDragStart, onClick, getPriorityColor, getMemberById }) => {
    const member = getMemberById(task.assignee);
  
    return (
      <div
        draggable
        onDragStart={onDragStart}
        onClick={() => onClick(task)}
        className={`p-3 rounded-lg shadow-sm cursor-pointer ${theme === 'dark' ? 'bg-zinc-700' : 'bg-white'}`}
      >
        <div className={`text-xs ${getPriorityColor(task.priority)} text-white py-1 px-2 rounded-md`}>
          {task.priority}
        </div>
        <p className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>{task.title}</p>
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Asignado a: {member.name}
        </p>
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Rol: {member.role}
        </p>
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Fecha: {task.startDate} - {task.endDate}
        </p>
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Historias de usuario: {task.userStories?.length || 0}
        </p>
      </div>
    );
  };
  
  export default KanbanTask;