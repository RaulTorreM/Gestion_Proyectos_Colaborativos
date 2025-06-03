import React, { useEffect, useRef, useState } from 'react';
import MessageInput from './MessageInput';

const MessageWindow = ({ user, messages }) => {
  const [localMessages, setLocalMessages] = useState(messages);
  const messagesEndRef = useRef(null);

  const handleSend = (newMessage) => {
    const msg = {
      from: 'Yo',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setLocalMessages((prev) => [...prev, msg]);
  };

  // Auto scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white dark:bg-black dark:border-white border-gray-300 shadow-md overflow-hidden">
    {/* Encabezado */}
    <header className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user.name}</h2>
        <span
        className={`inline-block w-3 h-3 rounded-full ${
            user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
        }`}
        title={user.status}
        ></span>
    </header>

{/* Área de mensajes */}
<div
  className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-black dark:border-white border border-gray-300 rounded-md"
  style={{
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  }}
>
  <style>
    {`
      .hide-scroll::-webkit-scrollbar {
        display: none;
      }
    `}
  </style>

  <div className="hide-scroll space-y-3">
    {localMessages.length === 0 ? (
      <p className="text-center text-gray-500 dark:text-white">No hay mensajes aún</p>
    ) : (
      localMessages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${
            msg.from === 'Yo' ? 'justify-end mr-4' : 'justify-start ml-4'
          }`}
        >
          <div
            className={`max-w-xs px-4 py-2 rounded-lg break-words ${
              msg.from === 'Yo'
                ? 'bg-green-600 text-white rounded-br-none'
                : 'bg-blue-600 text-white rounded-bl-none'
            }`}
          >
            <p className="text-sm">{msg.content}</p>
            <span
              className={`text-xs block mt-1 text-right ${
                // color negro en claro, blanco en oscuro
                msg.from === 'Yo'
                  ? 'text-black dark:text-white'
                  : 'text-black dark:text-white'
              }`}
            >
              {msg.timestamp}
            </span>
          </div>
        </div>
      ))
    )}

    <div ref={messagesEndRef} />
  </div>
</div>

{/* Input */}
<div className="p-4 border-t border-gray-300 dark:border-white bg-gray-100 dark:bg-black rounded-b-md">
  <MessageInput onSend={handleSend} />
</div>
    </div>
  );
};

export default MessageWindow;
