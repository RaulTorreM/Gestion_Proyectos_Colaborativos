const ProgressBar = ({ progress, theme }) => {
  const safeProgress = Number.isFinite(progress) ? Math.max(0, Math.min(progress, 100)) : 0;
  
  const getColor = () => {
    if (safeProgress === 0) return 'bg-gray-400';
    if (safeProgress < 30) return 'bg-red-500';
    if (safeProgress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`w-full h-1.5 md:h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
      <div 
        className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
};

export default ProgressBar;