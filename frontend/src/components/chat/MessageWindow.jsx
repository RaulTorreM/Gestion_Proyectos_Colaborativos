import React, { useEffect, useRef } from 'react';
import MessageInput from './MessageInput';

const MessageWindow = ({ user, messages, onSend }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white dark:bg-black dark:border-white border-gray-300 shadow-md overflow-hidden">
      <header className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user?.name}</h2>
        <span
          className={`inline-block w-3 h-3 rounded-full ${
            user?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
          }`}
          title={user?.status}
        ></span>
      </header>

      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-black dark:border-white border border-gray-300 rounded-md"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>
          {`.hide-scroll::-webkit-scrollbar { display: none; }`}
        </style>

        <div className="hide-scroll space-y-3">
          {messages?.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-white">No hay mensajes aún</p>
          ) : (
            messages
              ?.filter(msg => msg && (msg.from || msg.isFromCurrentUser) && msg.content)
              .map((msg, idx) => {
                const isCurrentUser = msg.isFromCurrentUser || msg.from === 'Yo';

                return (
                  <div
                    key={idx}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg break-words ${
                        isCurrentUser
                          ? 'bg-green-600 text-white rounded-br-none ml-8'
                          : 'bg-blue-600 text-white rounded-bl-none mr-8'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <span className="text-xs block mt-1 text-right opacity-70">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-gray-300 dark:border-white bg-gray-100 dark:bg-black rounded-b-md">
        <MessageInput onSend={onSend} />
      </div>
    </div>
  );
};

export default MessageWindow;