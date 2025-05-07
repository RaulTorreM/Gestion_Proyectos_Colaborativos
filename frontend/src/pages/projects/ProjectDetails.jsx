// src/pages/projects/ProjectDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import ProjectHeader from './ProjectDetails/ProjectHeader';
import ProjectMetrics from './ProjectDetails/ProjectMetrics';
import ProjectActivity from './ProjectDetails/ProjectActivity';
import ProjectPerformance from './ProjectDetails/ProjectPerformance';
import ProjectDocuments from './ProjectDetails/ProjectDocuments';
import EditProjectModal from './ProjectDetails/EditProjectModal';
import ProjectsService from '../../api/services/projectsService';
import UsersService from '../../api/services/usersService';
import EpicsService from '../../api/services/epicsService';
import VersionsService from '../../api/services/versionsService';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('details');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manager, setManager] = useState(null);
  const [versions, setVersions] = useState([]);
  const [epics, setEpics] = useState([]);
  const [members, setMembers] = useState([]);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectData = await ProjectsService.getProjectById(id);
        if (!projectData) {
          throw new Error('El proyecto no existe');
        }

        const memberIds = projectData.members.map(member => member.userId);

        const [managerData, versionsData, epicsData, membersData] = await Promise.all([
          UsersService.getUserById(projectData.authorUserId),
          VersionsService.getVersionsByIds(projectData.versions),
          EpicsService.getEpicsByIds(projectData.epics),
          UsersService.getUsersByIds(memberIds)
        ]);

        const membersWithDetails = projectData.members.map(member => ({
          ...member,
          userData: membersData.find(user => user._id === member.userId) || null
        }));

        setProject(projectData);
        setManager(managerData);
        setVersions(versionsData);
        setEpics(epicsData);
        setMembers(membersWithDetails);

      } catch (err) {
        setError(err.message || 'Error al cargar el proyecto');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="text-center p-8">Cargando proyecto...</div>;
  if (error) return <div className="text-red-500 p-8">Error: {error}</div>;
  if (!project) return <div className="p-8">Proyecto no encontrado</div>;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const transformedProject = {
    ...project,
    version: versions[0]?.name || 'v0.0.0',
    manager: manager?.name || 'Desconocido',
    startDate: formatDate(project.startDate),
    endDate: formatDate(project.endDate),
    members: members.map(member => ({
      ...member,
    })),
    tasks: {
      completed: epics.reduce((acc, epic) => acc + (epic.status === 'Completado' ? 1 : 0), 0),
      total: epics.length
    },
    versions: versions.map(version => ({
      id: version._id,
      name: version.name,
      status: version.status,
      progress: version.progress
    }))
  };

  const tabs = [
    { id: 'details', label: 'Detalles' },
    { id: 'performance', label: 'Rendimiento' },
    { id: 'documents', label: 'Documentos' }
  ];

  return (
    <div className={`min-h-screen p-4 md:p-6 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="max-w-[1800px] mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/projects')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 w-fit cursor-pointer 
                ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Proyectos
            </button>

            <button 
              onClick={() => setShowEditProjectModal(true)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 w-fit 
                ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM6 12v4h4v2H5a1 1 0 01-1-1v-5h2z" />
              </svg>
              Editar Proyecto
            </button>
          </div>
        </div>

        <div className="flex flex-col md:items-start my-5">
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {project.name} <span className="text-sm font-normal opacity-80">{transformedProject.version}</span>
          </h1>
          <p className={`mt-2 text-lm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} font-medium flex space-x-3 bg-transparent rounded-lg`}>
            <span className="text-gray-500">ID:</span> 
            <span className="font-semibold">{id}</span> 
            <span className="text-gray-500">| Estado:</span> 
            <span className="font-semibold">{project.status}</span> 
            <span className="text-gray-500">| Autor:</span> 
            <span className="font-semibold">{transformedProject.manager}</span>
          </p>

        </div>

        <ProjectHeader project={transformedProject} theme={theme} />

        <div className={`flex border-b mb-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm min-w-[120px] text-center
                ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={`mt-4`}>
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-1">
                <ProjectMetrics project={project} theme={theme} />
              </div>
              <div className="xl:col-span-3">
                <ProjectActivity projectId={id} theme={theme} />
              </div>
            </div>
          )}
          
          {activeTab === 'performance' && (
            <div className="w-full h-[600px]">
              <ProjectPerformance project={project} theme={theme} />
            </div>
          )}
          
          {activeTab === 'documents' && (
            <div className="w-full">
              <ProjectDocuments projectId={id} theme={theme} />
            </div>
          )}
        </div>

        {showEditProjectModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <EditProjectModal 
              onClose={() => setShowEditProjectModal(false)}
              project={project}
              onProjectUpdated={(updatedProject) => setProject(updatedProject)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
