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
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
    members: [],
    projectType: '',
    authorUserId: '',
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
  
  // useEffect solo llama a loadData una vez al montar
  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMember = () => {
    if (!selectedMember) return;
    
    // Verificar si el miembro ya existe
    const memberExists = newProject.members.some(m => m.userId === selectedMember);
    
    if (!memberExists) {
      // Crear objeto miembro con exactamente la estructura requerida
      const newMember = {
        userId: selectedMember,
        role: selectedRole,
        joinedAt: new Date().toISOString()
      };
      
      setNewProject(prev => ({
        ...prev,
        members: [...prev.members, newMember]
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
      // Validación básica antes de crear el proyecto
      if (!newProject.name || !newProject.description || !newProject.startDate || !newProject.dueDate) {
        setError('Por favor complete los campos obligatorios');
        return;
      }
      
      // Asegurar que las fechas estén en formato ISO
      const formattedProject = {
        ...newProject,
        startDate: new Date(newProject.startDate).toISOString(),
        dueDate: new Date(newProject.dueDate).toISOString(),
        projectType: newProject.projectType || "Desarrollo de software",
      };

      // Enviamos el objeto formateado según el esquema requerido
      await ProjectsService.createProject(formattedProject);
      await loadData();  
      setShowForm(false);
    } catch (error) {
      console.error('Error creating project:', error);
    
      if (error.response) {
        const { data } = error.response;
        console.error('Error response data:', data);
    
        if (data.errors && Array.isArray(data.errors)) {
          // Extraer mensajes de error
          const messages = data.errors.map(err => `${err.path}: ${err.msg}`);
          // Unir todos los mensajes en un solo string separado por salto de línea
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

  // Función auxiliar para obtener el nombre del usuario por ID
  const getUserNameById = (userId) => {
    const user = users.find(user => user._id === userId);
    return user ? user.name : 'Usuario desconocido';
  };

  const handleAuthorChange = (e) => {
    /* const { value } = e.target;
    setNewProject(prev => {
      const updatedProject = { ...prev, authorUserId: value };
      
      // Imprimir la data completa que se enviará al backend
      console.log('Proyecto actualizado:', updatedProject);
    }); */
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
                
                {/* Sección de Miembros con Select */}
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-white mb-2">Miembros</h3>
                  
                  {/* Formulario para agregar miembros */}
                  <div className="flex gap-2 mb-3">
                    <select
                      value={selectedMember}
                      onChange={(e) => setSelectedMember(e.target.value)}
                      className="flex-1 p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                    >
                      <option value="">Seleccione un miembro</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-1/3 p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                    >
                      <option value="Miembro">Miembro</option>
                      <option value="Administrador">Administrador</option>
                      <option value="Desarrollador">Desarrollador</option>
                      <option value="Tester">Tester</option>
                    </select>
                    
                    <button
                      onClick={handleAddMember}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer"
                    >
                      Añadir
                    </button>
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
                
                <div>
                  <h2 className='text-lg text-gray-500 dark:text-gray-300'>Autor:</h2>
                  <select
                    name="authorUserId"
                    value={newProject.authorUserId}
                    onChange={(e) => {
                      handleAuthorChange(e);
                      handleInputChange(e);
                    }}
                    className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                  >
                    <option value="">Seleccione el autor</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
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