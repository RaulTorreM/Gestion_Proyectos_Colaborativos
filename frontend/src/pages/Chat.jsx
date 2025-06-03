import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import UserSidebar from '../components/chat/UserSidebar';
import UserPopover from '../components/chat/UserPopover';
import MessageWindow from '../components/chat/MessageWindow';

const usersData = [
  { id: 1, name: 'Ana', status: 'online' },
  { id: 2, name: 'Luis', status: 'offline' },
  { id: 3, name: 'Carlos', status: 'online' },
  { id: 4, name: 'María', status: 'offline' },
  { id: 5, name: 'Pedro', status: 'online' },
];

const messagesData = {
  1: [{ from: 'Ana', content: 'Hola, ¿cómo va el proyecto?', timestamp: '10:00 AM' }],
  3: [{ from: 'Carlos', content: '¿Me puedes enviar el reporte?', timestamp: '9:15 AM' }],
  5: [{ from: 'Pedro', content: 'Listo para la reunión.', timestamp: '11:45 AM' }],
};

const Chat = () => {
  const { theme } = useTheme();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const buttonRef = useRef(null);

  const handleResize = () => setIsMobile(window.innerWidth < 768);
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUserSelect = (id) => {
    setSelectedUserId(id);
    setShowPopover(false); // Ocultar popover en móvil
  };

  // Cierra popover si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !buttonRef.current?.contains(e.target) &&
        !document.getElementById('user-popover')?.contains(e.target)
      ) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`flex h-screen bg-${theme === 'dark' ? 'black' : 'gray-100'}`}>
      {/* Chat + encabezado */}
      <div className="flex flex-col flex-grow p-4 relative">
        {/* Encabezado con botón usuarios en mobile */}
        <div className="flex justify-between items-center mb-4">
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Chat de Proyectos 2
          </h1>

          {isMobile && (
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setShowPopover(!showPopover)}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
              >
                Usuarios
              </button>

              {showPopover && (
                <div
                  id="user-popover"
                  className="absolute right-0 mt-2 z-50 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg rounded-lg p-4"
                >
                  <UserPopover
                    users={usersData}
                    onUserSelect={handleUserSelect}
                    selectedUserId={selectedUserId}
                    theme={theme}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Área de mensajes */}
        {selectedUserId ? (
          <MessageWindow
            user={usersData.find((u) => u.id === selectedUserId)}
            messages={messagesData[selectedUserId] || []}
          />
        ) : (
        <div className="flex-grow flex items-center justify-center border-2 border-dashed rounded-lg text-gray-700 dark:text-white">
          Selecciona un usuario para comenzar a chatear
        </div>
        )}
      </div>

      {/* Sidebar solo visible en desktop */}
      {!isMobile && (
        <UserSidebar
          users={usersData}
          selectedUserId={selectedUserId}
          onUserSelect={handleUserSelect}
          theme={theme}
          collapsed={collapsed}
          toggleCollapse={() => setCollapsed((prev) => !prev)}
        />
      )}
    </div>
  );
};

export default Chat;
