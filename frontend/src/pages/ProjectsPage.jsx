import { useState } from 'react';
import ProjectsHeader from '../components/projects/ProjectsHeader';
import ProjectsView from '../components/projects/ProjectsView';

const ProjectsPage = () => {
  const [showNewProject, setShowNewProject] = useState(false);

  return (
    <div className="p-6 bg-black min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Proyectos</h1>
          <p className="text-gray-500">Gestiona y visualiza todos tus proyectos</p>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-medium rounded-lg transition-colors border border-green-600"
        >
          + Nuevo Proyecto
        </button>
      </div>

      <ProjectsHeader />
      <ProjectsView />

      {showNewProject && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-lg border border-gray-800 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Nuevo Proyecto</h2>
              <button 
                onClick={() => setShowNewProject(false)}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="text-gray-400 mb-4">
              {/* Espacio reservado para el formulario */}
              Formulario aparecerá aquí
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewProject(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg border border-green-600"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;