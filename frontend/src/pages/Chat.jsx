import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import UserSidebar from '../components/chat/UserSidebar';
import UserPopover from '../components/chat/UserPopover';
import MessageWindow from '../components/chat/MessageWindow';
import ChatService from '../api/services/chatService';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { fetchIAWithTranslationPrompt } from '../utils/api_deepseek';

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

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await ChatService.getUsers();
        const users = Array.isArray(response) ? response : [];
        const currentUserId = auth?.user?.id;
        const enriched = users.map(u => ({
          ...u,
          isCurrentUser: u.id === currentUserId
        }));
        setCurrentUser(enriched.find(u => u.isCurrentUser) || null);
        setUsersData(enriched.filter(u => !u.isCurrentUser));
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setError('No se pudieron cargar los usuarios.');
        setLoading(false);
      }
    };
    fetchUsers();
  }, [auth?.user?.id]);

  // Cargar y traducir mensajes al cambiar de chat
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchMessages = async () => {
      try {
        const msgs = await ChatService.getMessages(selectedUserId);
        const enriched = await Promise.all(msgs.map(async m => ({
          ...m,
          translatedContent: await fetchIAWithTranslationPrompt(m.content)
        })));
        setMessagesData(prev => ({ ...prev, [selectedUserId]: enriched }));
      } catch (err) {
        console.error('Error al cargar mensajes:', err);
      }
    };
    fetchMessages();
  }, [selectedUserId]);

  // Socket setup
  useEffect(() => {
    if (!auth?.user?.token || !auth?.user?.id) return;

    const socket = io(SOCKET_URL, {
      auth: { token: auth.user.token },
      transports: ['websocket']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', auth.user.id);
    });

    socket.on('receiveMessage', async message => {
      const translated = await fetchIAWithTranslationPrompt(message.content);
      const fmsg = {
        ...message,
        translatedContent: translated,
        isFromCurrentUser: false,
        timestamp: message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessagesData(prev => {
        const arr = prev[message.from] || [];
        if (arr.some(m => m.id === message.id)) return prev;
        return { ...prev, [message.from]: [...arr, fmsg] };
      });
    });

    return () => socket.disconnect();
  }, [auth?.user]);

  // Enviar mensaje con carga de traducción
  const handleSendMessage = async (userId, content) => {
    if (!content.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      from: 'Yo',
      content,
      translatedContent: 'Traduciendo...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFromCurrentUser: true
    };
    setMessagesData(prev => ({
      ...prev,
      [userId]: [...(prev[userId] || []), tempMsg]
    }));

    try {
      const translated = await fetchIAWithTranslationPrompt(content);
      const sent = await ChatService.sendMessage(userId, translated);

      setMessagesData(prev => {
        const arr = prev[userId].map(m =>
          m.id === tempId
            ? { ...m, id: sent.id, translatedContent: translated, timestamp: sent.timestamp }
            : m
        );
        return { ...prev, [userId]: arr };
      });
    } catch (err) {
      console.error('Error al enviar/traducir mensaje:', err);
    }
  };

  const handleUserSelect = id => {
    setSelectedUserId(id);
    setShowPopover(false);
  };

  const bg = theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800';

  return (
    <div className={`flex h-screen ${bg}`}>
      <div className="flex-1 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Chat de Proyectos</h1>
          {isMobile && (
            <div className="relative">
              <button ref={buttonRef} onClick={() => setShowPopover(!showPopover)} className="bg-blue-600 text-white px-3 py-2 rounded">
                Usuarios
              </button>
              {showPopover && (
                <div className="absolute right-0 mt-2 z-50 w-64 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg rounded-lg p-4">
                  <UserPopover users={usersData} onUserSelect={handleUserSelect} selectedUserId={selectedUserId} theme={theme} />
                </div>
              )}
            </div>
          )}
        </div>

        {selectedUserId ? (
          <MessageWindow
            user={usersData.find(u => u.id === selectedUserId)}
            messages={messagesData[selectedUserId] || []}
            onSend={c => handleSendMessage(selectedUserId, c)}
          />
        ) : (
          <div className="flex-grow flex items-center justify-center border-2 border-dashed rounded-lg">
            {loading ? 'Cargando usuarios...' : error || 'Selecciona un usuario para comenzar.'}
          </div>
        )}
      </div>

      {!isMobile && (
        <UserSidebar
          users={[...usersData, ...(currentUser ? [currentUser] : [])]}
          selectedUserId={selectedUserId}
          onUserSelect={handleUserSelect}
          theme={theme}
          collapsed={collapsed}
          toggleCollapse={() => setCollapsed(!collapsed)}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};

export default Chat;
