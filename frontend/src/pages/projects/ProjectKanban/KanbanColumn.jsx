import KanbanTask from './KanbanTask';

const KanbanColumn = ({ column, theme, onDragStart, onDrop, onDragOver, onClickTask, getPriorityColor, getMemberById }) => {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={`rounded-lg p-3 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'} min-h-[300px] h-full`}
    >
      <h2 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        {column.title} ({column.tasks.length})
      </h2>

      <div className="space-y-2">
        {column.tasks.map((task) => (
          <KanbanTask
            key={task.id}
            task={task}
            theme={theme}
            onDragStart={(e) => onDragStart(e, task.id, column.id)}
            onClick={onClickTask}
            getPriorityColor={getPriorityColor}
            getMemberById={getMemberById}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;