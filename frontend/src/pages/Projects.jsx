import { useTheme } from '../context/ThemeContext';
import ProjectFilter from '../components/projects/ProjectFilter';
import ProjectCard from '../components/projects/ProjectCard';
import { useState, useEffect } from 'react'; 
import ProjectsService from '../api/services/projectsService';
import UsersService from '../api/services/usersService';

const Projects = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('');
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
    members: [],
    projectType: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedRole, setSelectedRole] = useState('Miembro');

  const loadData = async () => {
    try {
      const [projectsData, usersData] = await Promise.all([
        ProjectsService.getProjects(),
        UsersService.getAllUsers()
      ]);
  
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      const formattedUsers = Array.isArray(usersData) ? usersData : [];
      setUsers(formattedUsers);
  
      if (formattedUsers.length > 0) {
        setSelectedMember(formattedUsers[0]._id);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await UsersService.getAllUsers();
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };
  
  useEffect(() => {
    loadData();
    loadUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filtered = users.filter(
      user =>
        user.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
        user.email.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleAddMember = () => {
    if (!selectedMember) return;

    const memberExists = newProject.members.some(m => m.userId === selectedMember);

    if (!memberExists) {
      const newMember = {
        userId: selectedMember,
        role: selectedRole,
        joinedAt: new Date().toISOString(),
      };
      setNewProject(prev => ({
        ...prev,
        members: [...prev.members, newMember],
      }));
    }
  };

  const handleRemoveMember = (userId) => {
    setNewProject(prev => ({
      ...prev,
      members: prev.members.filter(m => m.userId !== userId)
    }));
  };

  const handleChangeMemberRole = (userId, newRole) => {
    setNewProject(prev => ({
      ...prev,
      members: prev.members.map(member => 
        member.userId === userId 
          ? {
              userId: member.userId,
              role: newRole,
              joinedAt: member.joinedAt
            } 
          : member
      )
    }));
  };

  const handleCreateProject = async () => {
    try {
      if (!newProject.name || !newProject.description || !newProject.startDate || !newProject.dueDate) {
        setError('Por favor complete los campos obligatorios');
        return;
      }
      
      const formattedProject = {
        ...newProject,
        startDate: new Date(newProject.startDate).toISOString(),
        dueDate: new Date(newProject.dueDate).toISOString(),
        projectType: newProject.projectType || "Desarrollo de software",
      };

      await ProjectsService.createProject(formattedProject);
      await loadData();  
      setShowForm(false);
    } catch (error) {
      console.error('Error creating project:', error);
    
      if (error.response) {
        const { data } = error.response;
        console.error('Error response data:', data);
    
        if (data.errors && Array.isArray(data.errors)) {
          const messages = data.errors.map(err => `${err.path}: ${err.msg}`);
          setError(messages.join('\n'));
        } else if (data.message) {
          setError(data.message);
        } else {
          setError('Error desconocido al crear el proyecto');
        }
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor:', error.request);
        setError('No se recibió respuesta del servidor');
      } else {
        setError(error.message || 'Error desconocido');
      }
    }
  };

  const filteredProjects = projects.filter(project => project) 
    .filter(project =>
      project.name.toLowerCase().includes(filter.toLowerCase()) ||
      project.description.toLowerCase().includes(filter.toLowerCase())
  );

  const getUserNameById = (userId) => {
    const user = users.find(user => user._id === userId);
    return user ? user.name : 'Usuario desconocido';
  };
  
  if (loading) return <div>Cargando proyectos...</div>;
  if (error) return <div className='font-semibold text-red-700 dark:text-white'>Error: {error}</div>;

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
                  <h2 className='text-lg text-gray-500 dark:text-gray-300'>Tipo de proyecto:</h2>
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
                  <h2 className='text-lg text-gray-500 dark:text-gray-300'>Nombre:</h2>
                  <input
                    type="text"
                    name="name"
                    placeholder="ej: Rediseño Plataforma E-learning"
                    value={newProject.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <h2 className='text-lg text-gray-500 dark:text-gray-300'>Descripción:</h2>
                  <textarea
                    name="description"
                    placeholder="ej: Actualización completa de la interfaz y funcionalidades de la plataforma de aprendizaje en línea..."
                    value={newProject.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <h2 className='text-lg text-gray-500 dark:text-gray-300'>Fecha de inicio:</h2>
                  <input
                    type="date"
                    name="startDate"
                    value={newProject.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                <div>
                  <h2 className='text-lg text-gray-500 dark:text-gray-300'>Fecha límite:</h2>
                  <input
                    type="date"
                    name="dueDate"
                    value={newProject.dueDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
                
                {/* Sección de Miembros */}
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-white mb-2">Miembros</h3>
                  
                  <div>
                    {/* Contenedor principal para campo de búsqueda y selector de rol */}
                    <div className="flex flex-row gap-3 mb-3 items-center">
                      {/* Campo de búsqueda - ocupa el espacio restante */}
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Buscar por nombre o correo"
                          value={searchTerm}
                          onChange={handleSearch}
                          className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                        />
                      </div>

                      {/* Selector de rol - ancho fijo */}
                      <div className="w-1/3">
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                        >
                          <option value="Miembro">Miembro</option>
                          <option value="Administrador">Administrador</option>
                          <option value="Desarrollador">Desarrollador</option>
                          <option value="Tester">Tester</option>
                        </select>
                      </div>
                    </div>

                    {/* Lista de usuarios filtrados */}
                    <div className="flex flex-col gap-2 mb-3">
                      {searchTerm && filteredUsers.length > 0 && (
                        filteredUsers.map(user => (
                          <div
                            key={user._id}
                            onClick={() => {
                              setSelectedMember(user._id);
                              const memberExists = newProject.members.some(m => m.userId === user._id);
                              if (!memberExists) {
                                const newMember = {
                                  userId: user._id,
                                  role: selectedRole,
                                  joinedAt: new Date().toISOString(),
                                };
                                setNewProject(prev => ({
                                  ...prev,
                                  members: [...prev.members, newMember],
                                }));
                              }
                            }}
                            className="flex justify-between items-center p-2 border dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700"
                          >
                            <span className="text-gray-800 dark:text-gray-200">
                              {user.name} - {user.email}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Lista de miembros agregados */}
                  <div className="max-h-40 overflow-y-auto border dark:border-zinc-700 rounded-lg p-2">
                    {newProject.members.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-2">
                        No hay miembros agregados
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {newProject.members.map((member) => (
                          <li key={member.userId} className="flex items-center justify-between border-b last:border-b-0 pb-1 dark:border-zinc-700">
                            <span className="text-gray-800 dark:text-gray-200">
                              {getUserNameById(member.userId)}
                            </span>

                            <div className="flex items-center gap-2">
                              <select
                                value={member.role}
                                onChange={(e) => handleChangeMemberRole(member.userId, e.target.value)}
                                className="p-1 text-sm border rounded dark:bg-zinc-800 dark:text-white"
                              >
                                <option value="Miembro">Miembro</option>
                                <option value="Administrador">Administrador</option>
                                <option value="Desarrollador">Desarrollador</option>
                                <option value="Tester">Tester</option>
                              </select>
                              
                              <button
                                onClick={() => handleRemoveMember(member.userId)}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 p-4 border-t dark:border-zinc-700">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleCreateProject();
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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