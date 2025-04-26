// src/components/projects/ProjectsFilter.jsx
import { useProjects } from '../../context/ProjectsContext';

const ProjectsFilter = () => {
  const { filters, setFilters } = useProjects();

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  return (
    <div className="w-full md:w-96 mb-6">
      <input
        type="text"
        placeholder="Buscar proyectos..."
        className="w-full px-4 py-2 border border-white border-opacity-30 bg-black text-white placeholder-gray-500 rounded-lg 
                 focus:outline-none focus:border-opacity-100 focus:ring-1 focus:ring-white transition-all"
        onChange={handleSearch}
      />
    </div>
  );
};

export default ProjectsFilter;