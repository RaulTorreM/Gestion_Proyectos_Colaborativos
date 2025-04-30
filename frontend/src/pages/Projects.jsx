// src/pages/Projects.jsx
import { useTheme } from '../context/ThemeContext';
import ProjectFilter from '../components/projects/ProjectFilter';
import ProjectCard from '../components/projects/ProjectCard';
import { useState, useEffect } from 'react'; 
import ProjectsService from '../api/services/projectsService';


const Projects = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('');
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'En Progreso',
    authorUserId: '',
    members: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  //UseEffect para poder los proyectos del service api
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await ProjectsService.getProjects();
        setProjects(data);
      } catch (err) {
        setError(err.message || 'Error al cargar proyectos');
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (member) => {
    setNewProject(prev => ({
      ...prev,
      members: prev.members.includes(member)
        ? prev.members.filter(m => m !== member)
        : [...prev.members, { userId: member, role: 'Miembro' }] 
    }));
  };

  const handleCreateProject = async () => {
    try {
      const projectToAdd = {
        ...newProject,
        dueDate: newProject.endDate, // La API requiere dueDate
        projectType: "Desarrollo de software" // Valor por defecto temporal
      };
      
      const createdProject = await ProjectsService.createProject(projectToAdd);
      setProjects(prev => [...prev, createdProject]);
      setShowForm(false);
      setNewProject({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'En Progreso',
        authorUserId: '',
        members: []
      });
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Error al crear el proyecto');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(filter.toLowerCase()) || 
    project.description.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div>Cargando proyectos...</div>;
  if (error) return <div>Error: {error}</div>;

  
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
          <ProjectCard 
            key={project._id} 
            project={{
              ...project,
              title: project.name, 
            }} 
            theme={theme} />
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
                name="name" 
                placeholder="Nombre del proyecto"
                value={newProject.name}
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
              <input
                type="text"
                name="authorUserId"
                placeholder="ID del autor"
                value={newProject.authorUserId}
                onChange={handleInputChange}
              />
              <select
                name="status"
                value={newProject.status}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg bg-white dark:bg-zinc-800 text-gray-700 dark:text-white"
              >
                <option value="En Progreso">En Progreso</option>
                <option value="No Iniciado">No Iniciado</option>
                <option value="Completado">Completado</option>
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
