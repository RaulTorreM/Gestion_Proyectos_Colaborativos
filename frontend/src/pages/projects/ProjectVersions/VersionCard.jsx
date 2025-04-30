// src/pages/projects/ProjectVersions/VersionCard.jsx
const VersionCard = ({ version, theme, onClick, isSelected }) => {
  const statusColors = {
    Completado: theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800',
    'En progreso': theme === 'dark' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-800',
    Planificado: theme === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-800',
    default: theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-800'
  };

  const progressColor = version.progress < 50 ? 'bg-red-500' : 
                      version.progress < 100 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? theme === 'dark' 
            ? 'bg-blue-900/30 border border-blue-700' 
            : 'bg-blue-100 border border-blue-300'
          : theme === 'dark' 
            ? 'bg-gray-700 hover:bg-gray-600' 
            : 'bg-white hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {version.name}
          </h3>
          <span className={`text-xs px-2 py-1 rounded mt-1 ${
            statusColors[version.status] || statusColors.default
          }`}>
            {version.status}
          </span>
          {version.description && (
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {version.description}
            </p>
          )}
        </div>
        
        {version.progress > 0 && (
          <div className="flex items-center gap-2">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {version.progress}%
            </span>
            <div className={`w-20 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
              <div 
                className={`h-full rounded-full ${progressColor}`}
                style={{ width: `${version.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-3">
        <div>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            {version.startDate ? new Date(version.startDate).toLocaleDateString() : 'Sin fecha'}
          </p>
        </div>
        <div>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            {version.completedIssues || 0}/{version.totalIssues || 0} issues
          </p>
        </div>
      </div>
    </div>
  );
};

export default VersionCard;