const UserPopover = ({ users, onUserSelect, selectedUserId, theme }) => {
  const online = users.filter((u) => u.status === 'online');
  const offline = users.filter((u) => u.status === 'offline');

  return (
    <div
      className={`flex flex-col gap-2 p-3 rounded-md border ${
        theme === 'dark' ? 'bg-black border-white' : 'bg-white border-gray-300'
      }`}
    >
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Conectados</h3>
      {online.length ? (
        online.map((user) => (
          <button
            key={user.id}
            onClick={() => onUserSelect(user.id)}
            className={`text-left py-1 px-2 rounded ${
              selectedUserId === user.id
                ? theme === 'dark'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-100 text-blue-900'
                : theme === 'dark'
                ? 'hover:bg-gray-700 text-green-400' // verde para conectados modo oscuro
                : 'hover:bg-gray-200 text-green-700' // verde para conectados modo claro
            }`}
          >
            {user.name}
          </button>
        ))
      ) : (
        <p className="text-xs text-gray-400">Sin conectados</p>
      )}

      <h3 className="text-sm font-semibold mt-2 text-gray-700 dark:text-gray-300">Desconectados</h3>
      {offline.length ? (
        offline.map((user) => (
          <button
            key={user.id}
            onClick={() => onUserSelect(user.id)}
            className={`text-left py-1 px-2 rounded ${
              selectedUserId === user.id
                ? theme === 'dark'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-100 text-blue-900'
                : theme === 'dark'
                ? 'hover:bg-gray-700 text-red-400' // rojo para desconectados modo oscuro
                : 'hover:bg-gray-200 text-red-700' // rojo para desconectados modo claro
            }`}
          >
            {user.name}
          </button>
        ))
      ) : (
        <p className="text-xs text-gray-400">Sin desconectados</p>
      )}
    </div>
  );
};

export default UserPopover;
