import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import UserSidebar from "../components/chat/UserSidebar";
import UserPopover from "../components/chat/UserPopover";
import MessageWindow from "../components/chat/MessageWindow";
import ChatService from "../api/services/chatService";
import { useAuth } from "../context/AuthContext";
import socketService from "../api/services/socketService";
import { fetchIAWithTranslationPrompt } from "../utils/api_deepseek";

const Chat = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );
  const [collapsed, setCollapsed] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [messagesData, setMessagesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const buttonRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const listenersSetupRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {}, [user]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await ChatService.getUsers();
        const users = Array.isArray(response) ? response : [];
        const currentUserId = user?.id || user?._id;

        const enriched = users.map((u) => ({
          ...u,
          isCurrentUser: (u.id || u._id) === currentUserId,
        }));
        setCurrentUser(enriched.find((u) => u.isCurrentUser) || null);
        setUsersData(enriched.filter((u) => !u.isCurrentUser));
        setLoading(false);
      } catch (err) {
        setError("No se pudieron cargar los usuarios.");
        setLoading(false);
      }
    };

    if (user?.id || user?._id) {
      fetchUsers();
    }
  }, [user?.id, user?._id]);

  useEffect(() => {
    if (!selectedUserId) return;

    const fetchMessages = async () => {
      try {
        const msgs = await ChatService.getMessages(selectedUserId);
        const enriched = await Promise.all(
          msgs.map(async (m) => ({
            ...m,
            translatedContent: await fetchIAWithTranslationPrompt(m.content),
          }))
        );
        setMessagesData((prev) => ({ ...prev, [selectedUserId]: enriched }));
      } catch {}
    };
    fetchMessages();
  }, [selectedUserId]);

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId) return;

    let messageCleanup = null;
    let connectionCleanup = null;

    const initializeSocket = async () => {
      try {
        if (socketService.connected) {
          if (socketService.currentUserId === userId) {
            setSocketConnected(true);
            return;
          } else {
            socketService.disconnect();
          }
        }

        await socketService.connect(userId);
        setSocketConnected(true);

        if (!listenersSetupRef.current) {
          messageCleanup = socketService.onMessage(async (message) => {
            try {
              const translated = await fetchIAWithTranslationPrompt(
                message.content
              );
              const formattedMsg = {
                ...message,
                translatedContent: translated,
                isFromCurrentUser: message.from === userId,
                timestamp:
                  message.timestamp ||
                  new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
              };

              setMessagesData((prev) => {
                const senderId = message.from;
                const currentMessages = prev[senderId] || [];
                if (currentMessages.some((m) => m.id === message.id)) {
                  return prev;
                }
                return {
                  ...prev,
                  [senderId]: [...currentMessages, formattedMsg],
                };
              });
            } catch {}
          });

          connectionCleanup = socketService.onConnectionChange((connected) => {
            setSocketConnected(connected);
            if (!connected && userId) {
              if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
              }
              reconnectTimeoutRef.current = setTimeout(() => {
                if (!socketService.connected) {
                  socketService.connect(userId).catch(() => {});
                }
              }, 3000);
            }
          });

          listenersSetupRef.current = true;
        }
      } catch {
        setSocketConnected(false);
      }
    };

    initializeSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [user?.id, user?._id]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketService.connected) {
        socketService.disconnect();
      }
      listenersSetupRef.current = false;
    };
  }, []);

  const handleSendMessage = async (userId, content) => {
    if (!content.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      from: "Yo",
      content,
      translatedContent: "Traduciendo...",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isFromCurrentUser: true,
    };

    setMessagesData((prev) => ({
      ...prev,
      [userId]: [...(prev[userId] || []), tempMsg],
    }));

    try {
      const translated = await fetchIAWithTranslationPrompt(content);
      let sent;
      if (socketService.connected) {
        sent = await socketService.sendMessage({
          to: userId,
          content: translated,
          originalContent: content,
        });
      } else {
        sent = await ChatService.sendMessage(userId, translated);
      }

      setMessagesData((prev) => {
        const updatedMessages = prev[userId].map((m) =>
          m.id === tempId
            ? {
                ...m,
                id: sent.id || sent._id,
                translatedContent: translated,
                timestamp:
                  sent.timestamp ||
                  new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
              }
            : m
        );
        return { ...prev, [userId]: updatedMessages };
      });
    } catch {
      setMessagesData((prev) => ({
        ...prev,
        [userId]: prev[userId].filter((m) => m.id !== tempId),
      }));
    }
  };

  const handleUserSelect = (id) => {
    setSelectedUserId(id);
    setShowPopover(false);
  };

  const bg =
    theme === "dark" ? "bg-black text-white" : "bg-gray-100 text-gray-800";

  return (
    <div className={`flex h-screen ${bg}`}>
      <div className="flex-1 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Chat de Proyectos</h1>
            <div className="flex items-center gap-2 mt-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  socketConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-gray-500">
                {socketConnected ? "Conectado" : "Desconectado"}
              </span>
            </div>
          </div>

          {isMobile && (
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setShowPopover(!showPopover)}
                className="bg-blue-600 text-white px-3 py-2 rounded"
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
            user={usersData.find((u) => u.id === selectedUserId)}
            messages={messagesData[selectedUserId] || []}
            onSend={(c) => handleSendMessage(selectedUserId, c)}
          />
        ) : (
          <div className="flex-grow flex items-center justify-center border-2 border-dashed rounded-lg">
            {loading
              ? "Cargando usuarios..."
              : error || "Selecciona un usuario para comenzar."}
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
