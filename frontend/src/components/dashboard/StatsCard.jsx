// src/components/dashboard/StatsCard.jsx
const StatsCard = ({ title, value, change, icon, theme }) => {
    const iconColors = {
      'LuFolder': theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      'LuClipboardList': theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
      'LuChartPie': theme === 'dark' ? 'text-green-400' : 'text-green-600',
      'LuUsers': theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
    };
  
    const iconType = icon.type.name;
    const iconColor = iconColors[iconType] || (theme === 'dark' ? 'text-gray-300' : 'text-gray-600');
  
    return (
      <div className={`
        rounded-xl p-5 shadow-sm transition-all h-full
        ${theme === 'dark' ? 'bg-zinc-900 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
      `}>
        <div className="flex justify-between items-start h-full">
          <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {title}
            </p>
            <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {value}
            </p>
            <p className={`text-xs mt-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              {change}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} ${iconColor}`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };
  
  export default StatsCard;