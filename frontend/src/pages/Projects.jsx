// src/pages/Projects.jsx
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import ProjectFilter from '../components/projects/ProjectFilter';
import ProjectCard from '../components/projects/ProjectCard';

const mockTeamMembers = [
  "Ana López (Diseñador UX/UI)",
  "Carlos Ruiz (Desarrollador Backend)",
  "María García (Desarrollador Frontend)",
  "Pedro Sánchez (QA Tester)",
  "Laura Martínez (Project Manager)",
  "Javier Moreno (Desarrollador Full Stack)"
];

const mockProjects = [
  {
    id: 1,
    title: "Sistema de Gestión",
    version: "v1.2.5",
    description: "Desarrollo de sistema para gestión interna de la empresa",
    startDate: "2023-05-15",
    endDate: "2023-11-30",
    manager: "Carlos Pérez",
    progress: 65,
    status: "En progreso"
  },
  {
    id: 2,
    title: "Portal Clientes",
    version: "v2.1.0",
    description: "Nuevo portal para clientes con autenticación mejorada",
    startDate: "2023-07-01",
    endDate: "2023-12-15",
    manager: "Ana Gómez",
    progress: 32,
    status: "En progreso"
  },
  {
    id: 3,
    title: "App Móvil",
    version: "v0.9.1",
    description: "Aplicación móvil para iOS y Android",
    startDate: "2023-09-10",
    endDate: "2024-02-28",
    manager: "David López",
    progress: 15,
    status: "Planificado"
  },
  {
    id: 4,
    title: "Migración BD",
    version: "v3.0.0",
    description: "Migración a nueva base de datos en la nube",
    startDate: "2023-04-01",
    endDate: "2023-08-30",
    manager: "María Rodríguez",
    progress: 100,
    status: "Completado"
  }
];

const Projects = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('');
  const [projects, setProjects] = useState(mockProjects);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Activo',
    manager: '',
    teamMembers: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (member) => {
    setNewProject(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(member)
        ? prev.teamMembers.filter(m => m !== member)
        : [...prev.teamMembers, member]
    }));
  };

  const handleCreateProject = () => {
    const projectToAdd = {
      ...newProject,
      id: projects.length + 1,
      version: "v1.0.0",
      progress: 0,
    };
    setProjects(prev => [...prev, projectToAdd]);
    setShowForm(false);
    setNewProject({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'Activo',
      manager: '',
      teamMembers: []
    });
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(filter.toLowerCase()) ||
    project.description.toLowerCase().includes(filter.toLowerCase())
  );

  // Lista de miembros disponibles (sin el que fue elegido como manager)
  const availableTeamMembers = mockTeamMembers.filter(member => member !== newProject.manager);

  return (
    <div className="relative p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Proyectos
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <ProjectFilter filter={filter} setFilter={setFilter} theme={theme} />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={`
              px-4 py-2 rounded-lg font-medium whitespace-nowrap
              ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}
            `}
          >
            + Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {filteredProjects.map(project => (
          <ProjectCard key={project.id} project={project} theme={theme} />
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-lg space-y-4 shadow-xl relative">   
            <h2 className="text-xl font-bold text-center text-gray-700 dark:text-white">Crear Nuevo Proyecto</h2>
            <p className="text-center text-gray-500 dark:text-gray-300">Completa la información para crear un nuevo proyecto.</p>
            
            {/* Formulario */}
            <div className="space-y-3">
              <input
                type="text"
                name="title"
                placeholder="Nombre del proyecto"
                value={newProject.title}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
              />
              <textarea
                name="description"
                placeholder="Describe el propósito del proyecto"
                value={newProject.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
              />
              <input
                type="date"
                name="startDate"
                value={newProject.startDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
              />
              <input
                type="date"
                name="endDate"
                value={newProject.endDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
              />
              <select
                name="status"
                value={newProject.status}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-800 text-gray-700 dark:text-white"
              >
                <option value="Activo">Activo</option>
                <option value="Planificado">Planificado</option>
                <option value="En Pausa">En Pausa</option>
              </select>

              {/* Selección de Administrador */}
              <div>
                <p className="font-semibold mb-2 text-gray-700 dark:text-white">Administrador del Proyecto</p>
                <select
                  name="manager"
                  value={newProject.manager}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-800 text-gray-700 dark:text-white"
                >
                  <option value="">Seleccionar administrador</option>
                  {mockTeamMembers.map(member => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selección de Miembros */}
              <div>
                <p className="font-semibold mb-2 text-gray-700 dark:text-white">Miembros del Equipo</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {availableTeamMembers.map(member => (
                    <label key={member} className="flex items-center space-x-2 text-gray-700 dark:text-white">
                      <input
                        type="checkbox"
                        checked={newProject.teamMembers.includes(member)}
                        onChange={() => handleCheckboxChange(member)}
                      />
                      <span>{member}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
              >
                Cerrar
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Crear Proyecto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
