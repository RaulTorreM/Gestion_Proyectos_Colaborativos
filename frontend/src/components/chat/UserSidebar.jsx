import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const UserSidebar = ({
  users = [],
  selectedUserId,
  onUserSelect,
  theme,
  collapsed,
  toggleCollapse,
  loading = false,
  error = null,
  currentUser = null
}) => {
  const onlineUsers = users.filter((u) => u.status === 'online' && u.id !== currentUser?.id);
  const offlineUsers = users.filter((u) => u.status === 'offline' && u.id !== currentUser?.id);

  return (
    <aside
      className={`
        flex flex-col h-full
        bg-white dark:bg-black border-l dark:border-gray-700
        rounded-tl-lg rounded-bl-lg
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-72'}
        overflow-hidden
      `}
    >
      <div
        className={`
          flex items-center justify-between px-4 py-3
          ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-blue-500 text-white'}
          rounded-tl-lg
        `}
      >
        {!collapsed && <h2 className="text-lg font-semibold select-none">Usuarios</h2>}
        <button
          onClick={toggleCollapse}
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          className="p-1 rounded hover:bg-blue-600/70 transition"
        >
          {collapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>
      </div>

      {!collapsed && currentUser && (
        <div className="px-3 mt-3">
          <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Tú</h3>
          <div
            className={`
              w-full text-left py-2 px-3 rounded
              ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}
              flex items-center gap-2 font-bold
            `}
          >
            <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
            {currentUser.name}
          </div>
        </div>
      )}

      <div className="flex-grow overflow-y-auto px-2 mt-4" style={{ scrollbarWidth: 'thin' }}>
        {loading || error ? (
          <p className={`text-center ${error ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {error || 'Cargando usuarios...'}
          </p>
        ) : (
          <>
            {!collapsed && (
              <>
                <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  Conectados
                </h3>
                {onlineUsers.length > 0 ? (
                  onlineUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => onUserSelect(user.id)}
                      className={`
                        w-full text-left py-2 px-3 rounded 
                        ${selectedUserId === user.id
                          ? theme === 'dark'
                            ? 'bg-gray-700 text-white font-bold'
                            : 'bg-gray-300 font-bold'
                          : theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-200'}
                        flex items-center gap-2
                      `}
                    >
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                      {user.name}
                    </button>
                  ))
                ) : (
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    No hay usuarios conectados
                  </p>
                )}

                <h3 className={`font-semibold mt-6 mb-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                  Desconectados
                </h3>
                {offlineUsers.length > 0 ? (
                  offlineUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => onUserSelect(user.id)}
                      className={`
                        w-full text-left py-2 px-3 rounded 
                        ${selectedUserId === user.id
                          ? theme === 'dark'
                            ? 'bg-gray-700 text-white font-bold'
                            : 'bg-gray-300 font-bold'
                          : theme === 'dark'
                          ? 'text-gray-400 hover:bg-gray-700'
                          : 'text-gray-600 hover:bg-gray-200'}
                        flex items-center gap-2
                      `}
                    >
                      <span className="inline-block w-3 h-3 rounded-full bg-gray-400"></span>
                      {user.name}
                    </button>
                  ))
                ) : (
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    No hay usuarios desconectados
                  </p>
                )}
              </>
            )}

            {collapsed && (
              <div className="flex flex-col items-center gap-3 mt-3">
                {[...onlineUsers, ...offlineUsers].map((user) => (
                  <button
                    key={user.id}
                    onClick={() => onUserSelect(user.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center
                      ${user.status === 'online'
                        ? selectedUserId === user.id
                          ? 'bg-green-600 ring-2 ring-green-400'
                          : 'bg-green-400'
                        : selectedUserId === user.id
                        ? 'bg-gray-600 ring-2 ring-gray-400'
                        : 'bg-gray-400'}
                      hover:brightness-110 transition`}
                    title={user.name}
                  >
                    <span className="text-white font-semibold select-none">{user.name[0]}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default UserSidebar;
