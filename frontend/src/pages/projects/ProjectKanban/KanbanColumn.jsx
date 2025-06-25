import KanbanEpic from './KanbanEpic';

const KanbanColumn = ({ column, theme, onDragStart, onDrop, onDragOver, onClickEpic, loggedUser }) => {
  const epics = column.epics || [];

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={`rounded-lg p-4 h-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}
    >
      <h2 className={`font-semibold mb-4 flex justify-between items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        <span>{column.title}</span>
        <span className={`text-sm px-2 py-1 rounded ${theme === 'dark' ? 'bg-zinc-700 text-gray-300' : 'bg-white text-gray-600'}`}>
          {epics.length}
        </span>
      </h2>

      <div className="space-y-3">
        {epics.map((epic) => {
          // Normalizar el ID siempre a 'id'
          const normalizedEpic = {
            ...epic,
            id: epic.id || epic._id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          };

          return (
            <KanbanEpic
              key={normalizedEpic.id}
              epic={normalizedEpic}
              theme={theme}
              onDragStart={(e) => onDragStart(e, normalizedEpic.id, column.id)}
              onClick={() => onClickEpic(normalizedEpic)}
              loggedUser={loggedUser}
            />
          );
        })}
      </div>
    </div>
  );
};

export default KanbanColumn;