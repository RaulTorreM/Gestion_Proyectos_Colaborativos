import KanbanTask from './KanbanTask';

const KanbanColumn = ({ column, theme, onDragStart, onDrop, onDragOver, onClickTask, getPriorityColor }) => {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={`rounded-lg p-4 h-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}
    >
      <h2 className={`font-semibold mb-4 flex justify-between items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        <span>{column.title}</span>
        <span className={`text-sm px-2 py-1 rounded ${theme === 'dark' ? 'bg-zinc-700 text-gray-300' : 'bg-white text-gray-600'}`}>
          {column.tasks.length}
        </span>
      </h2>

      <div className="space-y-3">
        {column.tasks.map((task) => (
          <KanbanTask
            key={task.id}
            task={task}
            theme={theme}
            onDragStart={(e) => onDragStart(e, task.id, column.id)}
            onClick={onClickTask}
            getPriorityColor={getPriorityColor}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;