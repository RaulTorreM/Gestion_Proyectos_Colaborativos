// src/components/projects/ProjectFilter.jsx
const ProjectFilter = ({ filter, setFilter, theme }) => {
    return (
      <div className="w-full">
        <input
          type="text"
          placeholder="Buscar proyectos..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`
            w-full p-2 md:p-3 rounded-lg border text-sm md:text-base
            ${theme === 'dark' ? 
              'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 
              'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}
          `}
        />
      </div>
    );
  };
  
  export default ProjectFilter;