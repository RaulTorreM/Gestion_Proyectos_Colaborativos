// src/pages/Users.jsx
import { useTheme } from '../context/ThemeContext';

const Users = () => {
  const { theme } = useTheme();

  return (
    <div className="p-4 md:p-6">
      <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Usuarios
      </h1>
      {/* Contenido de usuarios irá aquí */}
    </div>
  );
};

export default Users;