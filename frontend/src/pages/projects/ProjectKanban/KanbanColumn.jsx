import KanbanEpic from './KanbanEpic';

const KanbanColumn = ({ column, theme, onDragStart, onDrop, onDragOver, onClickEpic, loggedUser }) => {
  // Ensure epics exist before trying to map or count them
  const epics = column.epics || [];
  console.log(column.epics);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={`rounded-lg p-4 h-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}
    >
      <h2 className={`font-semibold mb-4 flex justify-between items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        <span>{column.name}</span>
        <span className={`text-sm px-2 py-1 rounded ${theme === 'dark' ? 'bg-zinc-700 text-gray-300' : 'bg-white text-gray-600'}`}>
          {epics.length}
        </span>
      </h2>

      <div className="space-y-3">
        {epics.map((epic, index) => {
          // Ensure we always have a unique key, even for newly created epics that might not have IDs yet
          const epicKey = epic._id || epic.id || `temp-epic-${index}`;
          
          return (
            <KanbanEpic
              key={epicKey}
              epic={{
                ...epic,
                id: epic.id || epic._id || epicKey, // Ensure id property exists for child component
              }}
              theme={theme}
              onDragStart={(e) => onDragStart(e, epic.id || epic._id || epicKey, column.id)}
              onClick={() => onClickEpic(epic)}
              loggedUser={loggedUser}
            />
          );
        })}
      </div>
    </div>
  );
};

export default KanbanColumn;