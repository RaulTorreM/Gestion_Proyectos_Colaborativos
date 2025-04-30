import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import VersionList from './ProjectVersions/VersionList';
import VersionDetails from './ProjectVersions/VersionDetail';
import AddVersionForm from './ProjectVersions/AddVersionForm';
import projectsData from './projectsData';
import EditVersionForm from './ProjectVersions/EditVersionForm';

const ProjectVersions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const allMembers = [
    { userId: 1, name: "Ana López", role: "Diseñador UX/UI" },
    { userId: 2, name: "Carlos Ruiz", role: "Desarrollador Backend" },
    { userId: 3, name: "María García", role: "Desarrollador Frontend" },
    { userId: 4, name: "Pedro Sánchez", role: "QA Tester" },
    { userId: 5, name: "Laura Martínez", role: "Project Manager" },
    { userId: 6, name: "Javier Moreno", role: "Desarrollador Full Stack" }
  ];

  // Obtener datos del proyecto
  const rawProject = projectsData[id] || {};
  const defaultProject = {
    name: `Proyecto ${id}`,
    versions: [],
    manager: 'No asignado',
    members: allMembers
  };
  const project = { ...defaultProject, ...rawProject };

  // Ordenar versiones por fecha (más reciente primero)
  const sortedVersions = [...(project.versions || [])].sort((a, b) => {
    const dateA = new Date(a.startDate || 0);
    const dateB = new Date(b.startDate || 0);
    return dateB - dateA;
  });

  // Estados del componente
  const [projectVersions, setProjectVersions] = useState(sortedVersions);
  const [selectedVersion, setSelectedVersion] = useState(sortedVersions[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddVersionForm, setShowAddVersionForm] = useState(false);
  const [editingVersion, setEditingVersion] = useState(null);

  useEffect(() => {
    const sorted = [...(project.versions || [])].sort((a, b) => {
      const dateA = new Date(a.startDate || 0);
      const dateB = new Date(b.startDate || 0);
      return dateB - dateA;
    });
    setProjectVersions(sorted);
    setSelectedVersion(sorted[0] || null);
  }, [id, project.versions]);

  const handleAddVersion = (newVersion) => {
    const newVersionId = Math.max(...projectVersions.map(v => v.id || 0), 0) + 1;
    const versionWithId = { 
      ...newVersion, 
      id: newVersionId,
      tasks: newVersion.releaseNotes || [],
      startDate: newVersion.startDate || new Date().toISOString()
    };
    const updatedVersions = [...projectVersions, versionWithId];
    
    const sortedUpdatedVersions = updatedVersions.sort((a, b) => {
      const dateA = new Date(a.startDate || 0);
      const dateB = new Date(b.startDate || 0);
      return dateB - dateA;
    });
    
    setProjectVersions(sortedUpdatedVersions);
    setSelectedVersion(versionWithId);
    setShowAddVersionForm(false);
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate(`/projects/${id}/details`)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'}`}
        >
          ← Volver a detalles
        </button>
          
          <button 
            onClick={() => navigate('/projects')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'}`}
          >
            ← Volver a proyectos
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Versiones: {project.name}
            </h1>
            <button 
              onClick={() => setShowAddVersionForm(true)}
              className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Versión
            </button>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manager: {project.manager}
          </p>
        </div>

        {showAddVersionForm && (
          <AddVersionForm 
            theme={theme}
            onSave={handleAddVersion}
            onCancel={() => setShowAddVersionForm(false)}
            projectMembers={project.members}
            allMembers={allMembers}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">
          <VersionList 
            versions={projectVersions}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedVersion={selectedVersion}
            setSelectedVersion={setSelectedVersion}
            theme={theme}
          />
          
          <div className="w-full lg:w-2/3">
            {selectedVersion ? (
              <VersionDetails 
                version={selectedVersion} 
                theme={theme}
                projectManager={project.manager}
                projectMembers={project.members}
                onEdit={() => setEditingVersion(selectedVersion)}
                versions={projectVersions}
                onVersionChange={setSelectedVersion}
              />
            ) : (
              <div className={`rounded-xl p-6 h-full flex items-center justify-center ${theme === 'dark' ? 'bg-black text-gray-400' : 'bg-white border border-gray-200 text-gray-500'}`}>
                <p>No hay versiones disponibles para este proyecto</p>
              </div>
            )}
          </div>
        </div>

        {editingVersion && (
          <EditVersionForm
            theme={theme}
            version={editingVersion}
            onSave={(updatedVersion) => {
              const updatedVersions = projectVersions.map(v => 
                v.id === updatedVersion.id ? updatedVersion : v
              );
              setProjectVersions(updatedVersions);
              setSelectedVersion(updatedVersion);
              setEditingVersion(null);
            }}
            onCancel={() => setEditingVersion(null)}
            projectMembers={project.members}
            allMembers={allMembers}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectVersions;