// src/pages/Chat.jsx
import { useTheme } from '../context/ThemeContext';

const Chat = () => {
  const { theme } = useTheme();

  return (
    <div className="p-4 md:p-6">
      <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Chat
      </h1>
      {/* Contenido de chat irá aquí */}
    </div>
  );
};

export default Chat;