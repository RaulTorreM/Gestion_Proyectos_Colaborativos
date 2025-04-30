// src/components/projects/ProjectActions.jsx
import { LuEye, LuList, LuLayoutGrid, LuArchive } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

const ProjectActions = ({ projectId, theme }) => {
  const navigate = useNavigate();

  const handleArchive = () => {
    // Confirmar acción
    const confirm = window.confirm('¿Estás seguro de que deseas archivar este proyecto?');
    if (!confirm) return;

    // Aquí puedes hacer la llamada a la API para archivar el proyecto
    // Ejemplo (usando fetch o axios):
    // await axios.post(`/api/projects/${projectId}/archive`);
    // También podrías emitir un estado o callback si estás usando Redux o Context

    console.log(`Proyecto ${projectId} archivado`); // Solo demostrativo
    alert('Proyecto archivado correctamente.');
  };

  const buttonStyle = `
    flex items-center justify-center p-1 md:p-2 rounded-lg text-xs md:text-sm
    ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
    transition-colors
  `;

  return (
    <div className="grid grid-cols-4 gap-1 md:gap-2">
      <button 
        onClick={() => navigate(`/projects/${projectId}/details`)}
        className={buttonStyle}
        title="Detalles"
      >
        <LuEye size={16} />
        <span className="hidden md:inline ml-2">Detalles</span>
      </button>

      <button 
        onClick={() => navigate(`/projects/${projectId}/versions`)}
        className={buttonStyle}
        title="Versiones"
      >
        <LuList size={16} />
        <span className="hidden md:inline ml-2">Versiones</span>
      </button>

      <button 
        onClick={() => navigate(`/projects/${projectId}/kanban`)}
        className={buttonStyle}
        title="Kanban"
      >
        <LuLayoutGrid size={16} />
        <span className="hidden md:inline ml-2">Kanban</span>
      </button>

      <button 
        onClick={handleArchive}
        className={buttonStyle}
        title="Archivar"
      >
        <LuArchive size={16} />
        <span className="hidden md:inline ml-2">Archivar</span>
      </button>
    </div>
  );
};

export default ProjectActions;
