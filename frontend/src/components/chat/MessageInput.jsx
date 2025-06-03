import React, { useState } from 'react';

const MessageInput = ({ onSend, theme }) => {
  const [input, setInput] = useState('');

  const handleSendClick = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="flex gap-2">
        <textarea
        rows={1}
        className={`
            flex-grow resize-none rounded-md
            border
            ${theme === 'dark' 
            ? 'border-gray-600 bg-black text-white placeholder-gray-400' 
            : 'border-gray-300 bg-white text-black placeholder-gray-500'}
            px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
        placeholder="Escribe un mensaje..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        />
      <button
        onClick={handleSendClick}
        className={`
          px-4 py-2 rounded-md text-white
          ${input.trim() ? 'bg-blue-800 hover:bg-blue-700' : 'bg-blue-600 opacity-50 cursor-not-allowed'}
          transition
        `}
        disabled={!input.trim()}
      >
        Enviar
      </button>
    </div>
  );
};

export default MessageInput;
