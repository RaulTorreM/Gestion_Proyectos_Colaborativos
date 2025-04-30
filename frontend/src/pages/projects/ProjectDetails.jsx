// src/pages/projects/ProjectDetails.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import ProjectHeader from './ProjectDetails/ProjectHeader';
import ProjectMetrics from './ProjectDetails/ProjectMetrics';
import ProjectActivity from './ProjectDetails/ProjectActivity';
import ProjectPerformance from './ProjectDetails/ProjectPerformance';
import ProjectDocuments from './ProjectDetails/ProjectDocuments';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('details');

  // Datos de ejemplo para cada proyecto basado en mockProjects
  const getProjectData = (projectId) => {
    const projects = {
      1: {
        _id: 1,
        name: "Sistema de Gestión",
        version: "v1.2.5",
        description: "Desarrollo de sistema para gestión interna de la empresa",
        startDate: "2023-05-15",
        endDate: "2023-11-30",
        manager: "Carlos Pérez",
        progress: 65,
        status: "En progreso",
        members: [
          { userId: "1", name: "Carlos Pérez", role: "Líder", joinedAt: "2023-05-10" },
          { userId: "2", name: "Ana Gómez", role: "Desarrollador", joinedAt: "2023-05-12" }
        ],
        tasks: { completed: 42, total: 65 },
        versions: [
          { id: 1, name: "v1.0.0", status: "Completado", progress: 100 },
          { id: 2, name: "v1.1.0", status: "Completado", progress: 100 },
          { id: 3, name: "v1.2.0", status: "Completado", progress: 100 },
          { id: 4, name: "v1.2.5", status: "En progreso", progress: 65 }
        ]
      },
      2: {
        _id: 2,
        name: "Portal Clientes",
        version: "v2.1.0",
        description: "Nuevo portal para clientes con autenticación mejorada",
        startDate: "2023-07-01",
        endDate: "2023-12-15",
        manager: "Ana Gómez",
        progress: 32,
        status: "En progreso",
        members: [
          { userId: "2", name: "Ana Gómez", role: "Líder", joinedAt: "2023-07-01" },
          { userId: "3", name: "David López", role: "Frontend", joinedAt: "2023-07-05" }
        ],
        tasks: { completed: 18, total: 56 },
        versions: [
          { id: 1, name: "v2.0.0", status: "Completado", progress: 100 },
          { id: 2, name: "v2.1.0", status: "En progreso", progress: 32 }
        ]
      },
      3: {
        _id: 3,
        name: "App Móvil",
        version: "v0.9.1",
        description: "Aplicación móvil para iOS y Android",
        startDate: "2023-09-10",
        endDate: "2024-02-28",
        manager: "David López",
        progress: 15,
        status: "Planificado",
        members: [
          { userId: "3", name: "David López", role: "Líder", joinedAt: "2023-09-10" },
          { userId: "4", name: "María Rodríguez", role: "Mobile", joinedAt: "2023-09-15" }
        ],
        tasks: { completed: 5, total: 33 },
        versions: [
          { id: 1, name: "v0.9.0", status: "Planificado", progress: 15 },
          { id: 2, name: "v0.9.1", status: "Planificado", progress: 15 }
        ]
      },
      4: {
        _id: 4,
        name: "Migración BD",
        version: "v3.0.0",
        description: "Migración a nueva base de datos en la nube",
        startDate: "2023-04-01",
        endDate: "2023-08-30",
        manager: "María Rodríguez",
        progress: 100,
        status: "Completado",
        members: [
          { userId: "4", name: "María Rodríguez", role: "Líder", joinedAt: "2023-04-01" },
          { userId: "1", name: "Carlos Pérez", role: "DBA", joinedAt: "2023-04-05" }
        ],
        tasks: { completed: 78, total: 78 },
        versions: [
          { id: 1, name: "v1.0.0", status: "Completado", progress: 100 },
          { id: 2, name: "v2.0.0", status: "Completado", progress: 100 },
          { id: 3, name: "v3.0.0", status: "Completado", progress: 100 }
        ]
      }
    };

    return projects[projectId] || {
      _id: projectId,
      name: `Proyecto ${projectId}`,
      version: "v0.0.0",
      description: "Proyecto no encontrado",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      status: "No definido",
      members: [],
      tasks: { completed: 0, total: 0 },
      versions: []
    };
  };

  // Obtenemos los datos específicos para este proyecto
  const project = getProjectData(parseInt(id));

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
            
            {project.versions.length > 0 && (
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
              {project.name} <span className="text-sm font-normal opacity-80">{project.version}</span>
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              ID: {id} | Estado: {project.status} | Responsable: {project.manager}
            </p>
          </div>
        </div>

        <ProjectHeader project={project} theme={theme} />

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