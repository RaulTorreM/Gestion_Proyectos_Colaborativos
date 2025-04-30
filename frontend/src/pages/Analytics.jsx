// src/pages/Analytics.jsx
import { useTheme } from '../context/ThemeContext';

const Analytics = () => {
  const { theme } = useTheme();

  return (
    <div className="p-4 md:p-6">
      <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Analíticas
      </h1>
      {/* Contenido de analíticas irá aquí */}
    </div>
  );
};

export default Analytics;