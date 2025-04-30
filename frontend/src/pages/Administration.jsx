// src/pages/Administration.jsx
import { useTheme } from '../context/ThemeContext';

const Administration = () => {
  const { theme } = useTheme();

  return (
    <div className="p-4 md:p-6">
      <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Administración
      </h1>
      {/* Contenido de administración irá aquí */}
    </div>
  );
};

export default Administration;