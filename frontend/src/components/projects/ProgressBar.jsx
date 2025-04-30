// src/components/projects/ProgressBar.jsx
const ProgressBar = ({ progress, theme }) => {
    const getColor = () => {
      if (progress < 50) return 'bg-red-500';
      if (progress < 96) return 'bg-yellow-500';
      return 'bg-green-500';
    };
  
    return (
      <div className={`w-full h-1.5 md:h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div 
          className={`h-full rounded-full ${getColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };
  
  export default ProgressBar;