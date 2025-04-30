// src/pages/Settings.jsx
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { theme } = useTheme();

  return (
    <div className="p-4 md:p-6">
      <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Configuración
      </h1>
      {/* Contenido de configuración irá aquí */}
    </div>
  );
};

export default Settings;