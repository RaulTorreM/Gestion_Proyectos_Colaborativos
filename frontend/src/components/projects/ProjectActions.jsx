// src/components/projects/ProjectActions.jsx
import { useState } from 'react';
import { LuEye, LuList, LuLayoutGrid, LuArchive } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

const ProjectActions = ({ projectId, theme, onArchive }) => {
  const navigate = useNavigate();
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchive = async () => {
    const confirm = window.confirm('¿Estás seguro de que deseas archivar este proyecto?');
    if (!confirm) return;

    try {
      setIsArchiving(true);
      if (onArchive) {
        await onArchive(projectId);
      }
    } catch (error) {
      console.error('Error al archivar:', error);
      alert(error.message || 'Error al archivar el proyecto');
    } finally {
      setIsArchiving(false);
    }
  };

  const buttonStyle = `
    flex items-center justify-center p-1 md:p-2 rounded-lg text-xs md:text-sm cursor-pointer
    ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
    ${isArchiving ? 'opacity-50 cursor-not-allowed' : ''}
    transition-colors
  `;

  return (
    <div className="grid grid-cols-4 gap-1 md:gap-2">
      <button
        onClick={() => navigate(`/projects/${projectId}/details`)}
        className={buttonStyle}
        title="Detalles"
        disabled={isArchiving}
      >
        <LuEye size={16} />
        <span className="hidden md:inline ml-2">Detalles</span>
      </button>

      <button
        onClick={() => navigate(`/projects/${projectId}/versions`)}
        className={buttonStyle}
        title="Versiones"
        disabled={isArchiving}
      >
        <LuList size={16} />
        <span className="hidden md:inline ml-2">Versiones</span>
      </button>

      <button
        onClick={() => navigate(`/projects/${projectId}/kanban`)}
        className={buttonStyle}
        title="Kanban"
        disabled={isArchiving}
      >
        <LuLayoutGrid size={16} />
        <span className="hidden md:inline ml-2">Kanban</span>
      </button>

      <button
        onClick={handleArchive}
        className={buttonStyle}
        title="Archivar"
        disabled={isArchiving}
      >
        {isArchiving ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <>
            <LuArchive size={16} />
            <span className="hidden md:inline ml-2">Archivar</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ProjectActions;
