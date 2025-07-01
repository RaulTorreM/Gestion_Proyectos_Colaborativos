import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import VersionList from './ProjectVersions/VersionList';
import VersionDetails from './ProjectVersions/VersionDetail';
import AddVersionForm from './ProjectVersions/AddVersionForm';
import EditVersionForm from './ProjectVersions/EditVersionForm';
import VersionsService from '../../api/services/versionsService';
import ProjectsService from '../../api/services/projectsService';
import UsersService from '../../api/services/usersService';

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

  const [projectVersions, setProjectVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddVersionForm, setShowAddVersionForm] = useState(false);
  const [editingVersion, setEditingVersion] = useState(null);
  const [projectName, setProjectName] = useState(`Proyecto ${id}`);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  // Obtener proyecto y versiones al cargar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const project = await ProjectsService.getProjectById(id);
        setProjectName(project?.name || `Proyecto ${id}`);

        const versions = await VersionsService.getVersionsByProject(id);
        const sortedVersions = versions.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        setProjectVersions(sortedVersions);

        if (sortedVersions.length > 0) {
          setSelectedVersion(sortedVersions[0]);
        }
      } catch (error) {
        console.error('Error al obtener datos:', error.message);
        setError('No se pudo cargar la información del proyecto');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    const loadAllUsers = async () => {
      const users = await UsersService.getAllUsers();
      setAllUsers(users);
    };
    loadAllUsers();
  }, []);

  const handleAddVersion = (newVersion) => {
    try {
      const updatedVersions = [...projectVersions, newVersion];
      const sorted = updatedVersions.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      setProjectVersions(sorted);
      setSelectedVersion(newVersion);
      setShowAddVersionForm(false);
    } catch (error) {
      console.error('Error al agregar versión al estado:', error);
      setError('Error al agregar la nueva versión al estado');
    }
  };

  const handleEditVersion = async (updatedVersionData) => {
    try {
      const response = await VersionsService.updateVersion(editingVersion._id, updatedVersionData);
      const updatedVersion = response.data || response;

      const updatedVersions = projectVersions.map(v =>
        v._id === updatedVersion._id ? updatedVersion : v
      );
      setProjectVersions(updatedVersions);
      setSelectedVersion(updatedVersion);
      setEditingVersion(null);
    } catch (error) {
      console.error('Error al actualizar versión:', error);
      setError('Error al actualizar la versión');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-4 md:p-6 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className={`rounded-xl p-6 h-64 flex items-center justify-center ${theme === 'dark' ? 'bg-black text-gray-400' : 'bg-white border border-gray-200 text-gray-500'}`}>
            <p>Cargando versiones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-6 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">

        {/* Navegación */}
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

        {/* Error Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Versiones: Proyecto {projectName}
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
        </div>

        {/* Formulario de nueva versión */}
        {showAddVersionForm && (
          <AddVersionForm
            theme={theme}
            onSave={handleAddVersion}
            onCancel={() => setShowAddVersionForm(false)}
            projectMembers={allMembers}
            allMembers={allMembers}
            projectId={id}
          />
        )}

        {/* Lista y detalle */}
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
                projectMembers={allUsers}
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

        {/* Edición */}
        {editingVersion && (
          <EditVersionForm
            theme={theme}
            version={editingVersion}
            onSave={handleEditVersion}
            onCancel={() => setEditingVersion(null)}
            projectMembers={allMembers}
            allMembers={allMembers}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectVersions;