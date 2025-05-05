// src/pages/projects/ProjectDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import ProjectHeader from './ProjectDetails/ProjectHeader';
import ProjectMetrics from './ProjectDetails/ProjectMetrics';
import ProjectActivity from './ProjectDetails/ProjectActivity';
import ProjectPerformance from './ProjectDetails/ProjectPerformance';
import ProjectDocuments from './ProjectDetails/ProjectDocuments';
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


  useEffect(() => {
      const fetchData = async () => {
        try {
            // console.log('ID del proyecto:', id); // ✅ Verifica que el ID es correcto
            const projectData = await ProjectsService.getProjectById(id);
            // console.log('Respuesta de la API:', projectData); // ⚠️ ¿Qué muestra aquí?
            
            if (!projectData) {
              throw new Error('El proyecto no existe');
            }
          
          // Obtener datos adicionales en paralelo
          const [managerData, versionsData, epicsData] = await Promise.all([
            UsersService.getUserById(projectData.authorUserId),
            VersionsService.getVersionsByIds(projectData.versions),
            EpicsService.getEpicsByIds(projectData.epics)
          ]);

          setProject(projectData);
          setManager(managerData);
          setVersions(versionsData);
          setEpics(epicsData);
          
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

    // Función para formatear fechas
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    // Estructura de datos para compatibilidad con componentes existentes
    const transformedProject = {
      ...project,
      version: versions[0]?.name || 'v0.0.0',
      manager: manager?.name || 'Desconocido',
      startDate: formatDate(project.startDate),
      endDate: formatDate(project.endDate),
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
        
        {/* Header superior */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/projects')}
              className={`
                px-4 py-2 rounded-lg flex items-center gap-2 w-fit
                ${theme === 'dark' ? 
                  'bg-gray-800 hover:bg-gray-700 text-white' : 
                  'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'}
              `}
            >
              ← Proyectos
            </button>
            
            {versions.length > 0 && (
              <button 
                onClick={() => navigate(`/projects/${id}/versions`)}
                className={`
                  px-4 py-2 rounded-lg flex items-center gap-2 w-fit
                  ${theme === 'dark' ? 
                    'bg-gray-800 hover:bg-gray-700 text-white' : 
                    'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'}
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                Versiones
              </button>
            )}
          </div>
          
          <div className="flex flex-col md:items-end">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {project.name} <span className="text-sm font-normal opacity-80">{transformedProject.version}</span>
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              ID: {id} | Estado: {project.status} | Responsable: {transformedProject.manager}
            </p>
          </div>
        </div>

        <ProjectHeader project={transformedProject} theme={theme} />

        {/* Pestañas */}
        <div className={`flex border-b mb-6 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 font-medium text-sm min-w-[120px] text-center
                ${activeTab === tab.id ?
                  theme === 'dark' ?
                    'text-blue-400 border-b-2 border-blue-500' :
                    'text-blue-600 border-b-2 border-blue-600' :
                  theme === 'dark' ?
                    'text-gray-400 hover:text-gray-300' :
                    'text-gray-600 hover:text-gray-800'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido optimizado para usar todo el espacio */}
        <div className="mt-4">
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
      </div>
    </div>
  );
};

export default ProjectDetails;