import { useTheme } from '../context/ThemeContext';
import ProjectFilter from '../components/projects/ProjectFilter';
import ProjectCard from '../components/projects/ProjectCard';
import { useState, useEffect } from 'react'; 
import ProjectsService from '../api/services/projectsService';
import UsersService from '../api/services/usersService'; // servicio para obtener usuarios

const Projects = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('');
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]); // usuarios disponibles para asignar
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
    status: 'En Progreso',
    authorUserId: '',
    members: [],
    projectType: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, usersData] = await Promise.all([
          ProjectsService.getProjects(),
          UsersService.getAllUsers()
        ]);
        setProjects(projectsData);
        setUsers(usersData);
      } catch (err) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberRoleChange = (userId, role) => {
    setNewProject(prev => {
      const existingMember = prev.members.find(m => m.userId === userId);
      if (existingMember) {
        return {
          ...prev,
          members: prev.members.map(m =>
            m.userId === userId ? { ...m, role } : m
          )
        };
      }
      return {
        ...prev,
        members: [...prev.members, { userId, role, joinedAt: new Date().toISOString() }]
      };
    });
  };

  const handleToggleMember = (userId) => {
    setNewProject(prev => {
      const exists = prev.members.find(m => m.userId === userId);
      if (exists) {
        return {
          ...prev,
          members: prev.members.filter(m => m.userId !== userId)
        };
      } else {
        return {
          ...prev,
          members: [...prev.members, { userId, role: 'Miembro', joinedAt: new Date().toISOString() }]
        };
      }
    });
  };

  const handleCreateProject = async () => {
    try {
      const projectToAdd = {
        ...newProject,
        projectType: newProject.projectType || "Desarrollo de software"
      };
      const createdProject = await ProjectsService.createProject(projectToAdd);
      setProjects(prev => [...prev, createdProject]);
      setShowForm(false);
      setNewProject({
        name: '',
        description: '',
        startDate: '',
        dueDate: '',
        authorUserId: '',
        members: [],
        projectType: ''
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
              px-4 py-2 rounded-lg font-medium whitespace-nowrap cursor-pointer
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
            project={{ ...project, title: project.name }}
            theme={theme}
          />
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-lg shadow-xl relative flex flex-col max-h-[90vh]">
            <div className="overflow-y-auto p-6 space-y-4">
              <h2 className="text-xl font-bold text-center text-gray-700 dark:text-white">Crear Nuevo Proyecto</h2>
              <p className="text-center text-gray-500 dark:text-gray-300">Completa la información para crear un nuevo proyecto.</p>

              <div className="space-y-3">
                <div>
                  Tipo de proyecto:
                  <input
                    type="text"
                    name="projectType"
                    placeholder="ej: Desarrollo de Software"
                    value={newProject.projectType}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  Nombre:
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre del proyecto"
                    value={newProject.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  Descripción:
                  <textarea
                    name="description"
                    placeholder="Descripción..."
                    value={newProject.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  Fecha de inicio:
                  <input
                    type="date"
                    name="startDate"
                    value={newProject.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  Fecha límite:
                  <input
                    type="date"
                    name="dueDate"
                    value={newProject.dueDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  Autor:
                  <input
                    type="text"
                    name="authorUserId"
                    placeholder="ID del autor"
                    value={newProject.authorUserId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                {/* Miembros */}
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-white">Miembros</h3>
                  {users.map(user => (
                    <div key={user._id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!newProject.members.find(m => m.userId === user._id)}
                        onChange={() => handleToggleMember(user._id)}
                      />
                      <span className="text-gray-800 dark:text-gray-200">{user.name}</span>
                      {newProject.members.find(m => m.userId === user._id) && (
                        <select
                          value={newProject.members.find(m => m.userId === user._id)?.role}
                          onChange={e => handleMemberRoleChange(user._id, e.target.value)}
                          className="p-1 rounded border text-sm dark:bg-zinc-800 dark:text-white"
                        >
                          <option value="Miembro">Miembro</option>
                          <option value="Administrador">Administrador</option>
                          <option value="Desarrollador">Desarrollador</option>
                          <option value="Tester">Tester</option>
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 p-4 border-t dark:border-zinc-700">
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
