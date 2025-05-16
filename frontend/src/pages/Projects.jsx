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

  useEffect(() => {
    loadData();
  }, []);

  const parseISOAsUTC = (isoString) => {
    const [year, month, day] = isoString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };

  const formatShortDate = (isoString) => {
    if (!isoString) return '';
    const date = parseISOAsUTC(isoString);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatLongDate = (isoString) => {
    if (!isoString) return 'No definida';
    const date = parseISOAsUTC(isoString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  const calculateDuration = (startIso, endIso) => {
    if (!startIso || !endIso) return 'No definida';

    try {
      const start = new Date(startIso);
      const end = new Date(endIso);
      const timeDiff = end - start;
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      return `${dayDiff} días`;
    } catch (error) {
      console.error('Error calculando duración:', error);
      return 'No definida';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMember = () => {
    if (!selectedMember) return;
    const memberExists = newProject.members.some(m => m.userId === selectedMember);
    if (!memberExists) {
      const newMember = {
        userId: selectedMember,
        role: selectedRole,
        joinedAt: new Date().toISOString()
      };
      setNewProject(prev => ({ ...prev, members: [...prev.members, newMember] }));
    }
  };

  const handleRemoveMember = (userId) => {
    setNewProject(prev => ({ ...prev, members: prev.members.filter(m => m.userId !== userId) }));
  };

  const handleChangeMemberRole = (userId, newRole) => {
    setNewProject(prev => ({
      ...prev,
      members: prev.members.map(member =>
        member.userId === userId
          ? { userId: member.userId, role: newRole, joinedAt: member.joinedAt }
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

      const inputDateToISO = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return new Date(Date.UTC(year, month - 1, day)).toISOString();
      };

      const formattedProject = {
        ...newProject,
        startDate: inputDateToISO(newProject.startDate),
        dueDate: inputDateToISO(newProject.dueDate),
        projectType: newProject.projectType || "Desarrollo de software",
      };

      await ProjectsService.createProject(formattedProject);
      await loadData();
      setShowForm(false);
      setNewProject({
        name: '',
        description: '',
        startDate: '',
        dueDate: '',
        members: [],
        projectType: '',
      });
    } catch (error) {
      console.error('Error creating project:', error);
      if (error.response) {
        const { data } = error.response;
        if (data.errors && Array.isArray(data.errors)) {
          const messages = data.errors.map(err => `${err.path}: ${err.msg}`);
          setError(messages.join('\n'));
        } else if (data.message) {
          setError(data.message);
        } else {
          setError('Error desconocido al crear el proyecto');
        }
      } else if (error.request) {
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
            project={{ 
              ...project, 
              title: project.name,
              formattedStartDate: formatShortDate(project.startDate),
              formattedDueDate: formatShortDate(project.dueDate),
              duration: calculateDuration(project.startDate, project.dueDate),
              rawStartDate: project.startDate,
              rawEndDate: project.dueDate,
              longFormattedStartDate: formatLongDate(project.startDate),
              longFormattedDueDate: formatLongDate(project.dueDate)
            }}
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