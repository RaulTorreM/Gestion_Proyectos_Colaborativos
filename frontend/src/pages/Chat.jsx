import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import UserSidebar from '../components/chat/UserSidebar';
import UserPopover from '../components/chat/UserPopover';
import MessageWindow from '../components/chat/MessageWindow';
import ChatService from '../api/services/chatService';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

const Chat = () => {
  const { theme } = useTheme();
  const auth = useAuth();

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [messagesData, setMessagesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const buttonRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const socketRef = useRef(null);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Obtener lista de usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await ChatService.getUsers();
        const users = Array.isArray(response) ? response : [];

        const currentUserId = auth?.user?.id;
        const enrichedUsers = users.map(user => ({
          ...user,
          isCurrentUser: user.id === currentUserId,
        }));

        const current = enrichedUsers.find(u => u.id === currentUserId);
        const others = enrichedUsers.filter(u => u.id !== currentUserId);

        setCurrentUser(current);
        setUsersData(others);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setError('No se pudieron cargar los usuarios.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [auth?.user?.id]);

  // Obtener mensajes al seleccionar usuario
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchMessages = async () => {
      try {
        const messages = await ChatService.getMessages(selectedUserId);
        setMessagesData(prev => ({
          ...prev,
          [selectedUserId]: messages || [],
        }));
      } catch (err) {
        console.error('Error al cargar mensajes:', err);
      }
    };

    fetchMessages();
  }, [selectedUserId]);

  // Configurar conexión del socket
  useEffect(() => {
    if (!auth?.user?.token || !auth?.user?.id) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token: auth.user.token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket conectado:', socketRef.current.id);
      socketRef.current.emit('join', auth.user.id);
    });

    socketRef.current.on('joinConfirmed', (data) => {
      console.log('Unido correctamente a la sala:', data);
    });

    socketRef.current.on('receiveMessage', (message) => {
      console.log('Mensaje recibido vía socket:', message);

      const formattedMessage = {
        id: message.id,
        from: message.from,
        content: message.content,
        timestamp: message.timestamp || new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isFromCurrentUser: false
      };

      setMessagesData(prev => {
        const currentMessages = prev[message.from] || [];
        if (currentMessages.some(msg => msg.id === message.id)) return prev;

        return {
          ...prev,
          [message.from]: [...currentMessages, formattedMessage],
        };
      });
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Error de conexión socket:', err.message);
      setTimeout(() => {
        socketRef.current.connect();
      }, 1000);
    });

    return () => {
      if (socketRef.current) {
        console.log('Desconectando socket...');
        socketRef.current.disconnect();
      }
    };
  }, [auth?.user?.token, auth?.user?.id]);

  const handleSendMessage = async (userId, content) => {
    if (!content.trim()) return;

    try {
      const newMessage = await ChatService.sendMessage(userId, content);
      setMessagesData(prev => {
        const currentMessages = prev[userId] || [];

        const exists = currentMessages.some(msg => msg.id === newMessage.id);
        if (exists) return prev;

        const formattedMessage = {
          id: newMessage.id,
          from: 'Yo',
          content: newMessage.content,
          timestamp: newMessage.timestamp,
          isFromCurrentUser: true
        };

        return {
          ...prev,
          [userId]: [...currentMessages, formattedMessage],
        };
      });
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }
  };

  const handleUserSelect = (id) => {
    setSelectedUserId(id);
    setShowPopover(false);
  };

  const bgClass = theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800';

  return (
    <div className={`flex h-screen ${bgClass}`}>
      <div className="flex flex-col flex-grow p-4 relative">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Chat de Proyectos 2</h1>

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
                <div className="absolute right-0 mt-2 z-50 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg rounded-lg p-4">
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

        {selectedUserId ? (
          <MessageWindow
            user={usersData.find(u => u.id === selectedUserId)}
            messages={messagesData[selectedUserId] || []}
            onSend={(content) => handleSendMessage(selectedUserId, content)}
          />
        ) : (
          <div className="flex-grow flex items-center justify-center border-2 border-dashed rounded-lg">
            {loading ? 'Cargando usuarios...' : error ? error : 'Selecciona un usuario para comenzar a chatear'}
          </div>
        )}
      </div>

      {!isMobile && (
        <UserSidebar
          users={[...(usersData || []), ...(currentUser ? [currentUser] : [])]}
          selectedUserId={selectedUserId}
          onUserSelect={handleUserSelect}
          theme={theme}
          collapsed={collapsed}
          toggleCollapse={() => setCollapsed(prev => !prev)}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};

export default Chat;
