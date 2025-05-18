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
      setError(null); // Limpiar error si carga bien
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
    if (!isoString) return null;
    const [year, month, day] = isoString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };

  const formatShortDate = (isoString) => {
    if (!isoString) return '';
    const date = parseISOAsUTC(isoString);
    if (!date) return '';
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatLongDate = (isoString) => {
    if (!isoString) return 'No definida';
    const date = parseISOAsUTC(isoString);
    if (!date) return 'No definida';
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
      // Usar parseISOAsUTC para consistencia
      const start = parseISOAsUTC(startIso);
      const end = parseISOAsUTC(endIso);
      if (!start || !end) return 'No definida';

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
          ? { ...member, role: newRole }
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

      setError(null); // Limpiar error antes de crear

      // Reusar parseISOAsUTC para convertir fechas
      const inputDateToISO = (dateString) => {
        const date = parseISOAsUTC(dateString);
        return date ? date.toISOString() : null;
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

  const handleProjectArchive = async (projectId) => {
    try {
      // 1. Convertir IDs a string para comparación segura
      const projectIdStr = projectId.toString();
      
      // 2. Filtrado correcto del proyecto específico
      setProjects(prevProjects => {
        const updatedProjects = prevProjects.filter(
          project => project._id.toString() !== projectIdStr
        );
        
        console.log('Proyecto archivado:', projectIdStr);
        console.log('Proyectos restantes:', updatedProjects.map(p => p._id));
        
        return updatedProjects;
      });

      // 3. Archivado en el backend
      await ProjectsService.archiveProject(projectId);

    } catch (error) {
      console.error('Error al archivar:', error);
      // Recargar para mantener consistencia
      await loadData();
      throw error; // Para mostrar el error en ProjectActions
    }
  };

  const filteredProjects = projects.filter(project =>
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
            onArchive={handleProjectArchive}
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
                  <h2 className="text-lg text-gray-500 dark:text-gray-300">Nombre:</h2>
                  <input
                    type="text"
                    name="name"
                    value={newProject.name}
                    onChange={handleInputChange}
                    placeholder="Nombre del proyecto"
                    className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <h2 className="text-lg text-gray-500 dark:text-gray-300">Descripción:</h2>
                  <textarea
                    name="description"
                    value={newProject.description}
                    onChange={handleInputChange}
                    placeholder="Descripción del proyecto"
                    rows={3}
                    className="w-full p-2 border rounded-lg resize-none text-gray-700 dark:bg-zinc-800 dark:text-white"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <h2 className="text-lg text-gray-500 dark:text-gray-300">Fecha inicio:</h2>
                    <input
                      type="date"
                      name="startDate"
                      value={newProject.startDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg text-gray-500 dark:text-gray-300">Fecha fin:</h2>
                    <input
                      type="date"
                      name="dueDate"
                      value={newProject.dueDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Miembros */}
                <div className="space-y-2">
                  <h2 className="text-lg text-gray-500 dark:text-gray-300">Miembros del proyecto:</h2>
                  <div className="flex gap-3 items-center">
                    <select
                      value={selectedMember}
                      onChange={(e) => setSelectedMember(e.target.value)}
                      className="flex-1 p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                    >
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="p-2 border rounded-lg text-gray-700 dark:bg-zinc-800 dark:text-white"
                    >
                      <option>Miembro</option>
                      <option>Administrador</option>
                      <option>Líder</option>
                    </select>
                    <button
                      onClick={handleAddMember}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Añadir
                    </button>
                  </div>

                  <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-zinc-700 rounded-lg p-2">
                    {newProject.members.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400">No hay miembros añadidos.</p>
                    )}
                    {newProject.members.map(member => (
                      <div
                        key={member.userId}
                        className="flex items-center justify-between gap-3 py-1"
                      >
                        <span className="flex-1 text-gray-700 dark:text-white">{getUserNameById(member.userId)}</span>
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeMemberRole(member.userId, e.target.value)}
                          className="p-1 border rounded text-gray-700 dark:bg-zinc-800 dark:text-white"
                        >
                          <option>Miembro</option>
                          <option>Administrador</option>
                          <option>Líder</option>
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="text-red-600 font-bold px-2"
                          title="Eliminar miembro"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 whitespace-pre-line font-semibold">{error}</div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border-t border-gray-300 dark:border-zinc-700">
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProject}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
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
