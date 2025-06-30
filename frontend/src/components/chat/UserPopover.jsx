const UserPopover = ({
  users = [],
  onUserSelect,
  selectedUserId,
  theme,
  currentUser = null,
}) => {
  // Filtrar usuarios conectados (excluyendo al usuario actual si es necesario)
  const onlineUsers = users.filter(
    (u) => u.status === "online" && u.id !== currentUser?.id
  );
  // Filtrar usuarios desconectados (excluyendo al usuario actual si es necesario)
  const offlineUsers = users.filter(
    (u) => u.status === "offline" && u.id !== currentUser?.id
  );

  return (
    <div
      className={`flex flex-col gap-2 p-3 rounded-md border ${
        theme === "dark" ? "bg-black border-white" : "bg-white border-gray-300"
      }`}
    >
      {/* Mostrar usuario actual primero si está online */}
      {currentUser?.status === "online" && (
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Tú
          </h3>
          <button
            onClick={() => onUserSelect(currentUser.id)}
            className={`w-full text-left py-1 px-2 rounded ${
              selectedUserId === currentUser.id
                ? theme === "dark"
                  ? "bg-blue-700 text-white"
                  : "bg-blue-100 text-blue-900"
                : theme === "dark"
                ? "bg-gray-800 text-green-400"
                : "bg-gray-100 text-green-700"
            } font-bold`}
          >
            {currentUser.name} (Tú)
          </button>
        </div>
      )}

      {/* Lista de usuarios conectados */}
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Conectados
      </h3>
      {onlineUsers.length > 0 ? (
        onlineUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => onUserSelect(user.id)}
            className={`w-full text-left py-1 px-2 rounded ${
              selectedUserId === user.id
                ? theme === "dark"
                  ? "bg-blue-700 text-white"
                  : "bg-blue-100 text-blue-900"
                : theme === "dark"
                ? "hover:bg-gray-700 text-green-400"
                : "hover:bg-gray-200 text-green-700"
            }`}
          >
            {user.name}
          </button>
        ))
      ) : (
        <p className="text-xs text-gray-400">Sin conectados</p>
      )}

      {/* Lista de usuarios desconectados */}
      <h3 className="text-sm font-semibold mt-2 text-gray-700 dark:text-gray-300">
        Desconectados
      </h3>
      {offlineUsers.length > 0 ? (
        offlineUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => onUserSelect(user.id)}
            className={`w-full text-left py-1 px-2 rounded ${
              selectedUserId === user.id
                ? theme === "dark"
                  ? "bg-blue-700 text-white"
                  : "bg-blue-100 text-blue-900"
                : theme === "dark"
                ? "hover:bg-gray-700 text-red-400"
                : "hover:bg-gray-200 text-red-700"
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
