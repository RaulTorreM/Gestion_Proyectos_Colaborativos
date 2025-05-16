import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import ProjectHeader from './ProjectDetails/ProjectHeader';
import ProjectMetrics from './ProjectDetails/ProjectMetrics';
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
  
  // Estados
  const [activeTab, setActiveTab] = useState('details');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manager, setManager] = useState(null);
  const [versions, setVersions] = useState([]);
  const [epics, setEpics] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState({
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
    endDate: '',
    members: []
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [users, setUsers] = useState([]);

  // Función para convertir fecha ISO a formato YYYY-MM-DD (para inputs)
  const isoToInputDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Ajustar para evitar problemas de zona horaria
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return adjustedDate.toISOString().split('T')[0];
  };

  // Función para convertir fecha YYYY-MM-DD a ISO string
  const inputDateToISO = (inputDate) => {
    if (!inputDate) return null;
    // Asegurar que la fecha se interprete correctamente sin ajustes de zona horaria
    const date = new Date(inputDate);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
  };

  // Función para formatear fechas en la vista normal
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'No definida';
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC'
    };
    return date.toLocaleDateString('es-ES', options);
  };

  // useMemo para transformedProject
  const transformedProject = useMemo(() => {
    if (!project) return null;
    
    return {
      ...project,
      version: versions[0]?.name || 'v0.0.0',
      manager: manager?.name || 'Desconocido',
      rawStartDate: project.startDate,
      rawEndDate: project.endDate,
      formattedStartDate: formatDisplayDate(project.startDate),
      formattedEndDate: formatDisplayDate(project.endDate),
      epics: {
        completed: epics.filter(epic => epic?.status === 'Completado').length,
        total: epics.length
      },
      versions: versions.map(version => ({
        id: version?._id,
        name: version?.name || 'Sin nombre',
        status: version?.status || 'Desconocido',
        progress: version?.progress || 0
      }))
    };
  }, [project, versions, manager, epics]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Obtener todos los usuarios primero
        const allUsers = await UsersService.getAllUsers();
        setUsers(allUsers);

        const projectData = await ProjectsService.getProjectById(id);
        if (!projectData) {
          throw new Error('El servidor no devolvió datos del proyecto');
        }

        const requests = [];

        if (projectData.authorUserId) {
          requests.push(
            UsersService.getUserById(projectData.authorUserId)
              .then(userData => setManager(userData))
              .catch(() => setManager(null))
          );
        }

        if (projectData.versions?.length > 0) {
          requests.push(
            VersionsService.getVersionsByIds(projectData.versions)
              .then(versionsData => setVersions(Array.isArray(versionsData) ? versionsData : []))
              .catch(() => setVersions([]))
          );
        }

        requests.push(
          EpicsService.getEpicsByProjectId(id)
            .then(epicsData => setEpics(Array.isArray(epicsData) ? epicsData : []))
            .catch(() => setEpics([]))
        );

        await Promise.all(requests);
        setProject(projectData);
        setEditedProject({
          name: projectData.name,
          description: projectData.description || '',
          startDate: isoToInputDate(projectData.startDate),
          dueDate: isoToInputDate(projectData.dueDate),
          endDate: isoToInputDate(projectData.endDate),
          members: [...(projectData.members || [])] // Copia de los miembros
        });
        
      } catch (err) {
        console.error('Error al cargar proyecto:', err);
        setError(err.message);
        
        if (err.message.includes('no encontrado')) {
          navigate('/projects', { replace: true, state: { error: err.message } });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMember = (userId, role) => {
    setEditedProject(prev => ({
      ...prev,
      members: [
        ...(prev.members || []),
        { userId, role }
      ]
    }));
  };

  const handleChangeMemberRole = (userId, newRole) => {
    setEditedProject(prev => ({
      ...prev,
      members: (prev.members || []).map(member => 
        member.userId === userId ? { ...member, role: newRole } : member
      )
    }));
  };

  const handleRemoveMember = (userId) => {
    setEditedProject(prev => ({
      ...prev,
      members: (prev.members || []).filter(member => member.userId !== userId)
    }));
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    setSaveError(null);

    try {
      const updatedData = {
        name: editedProject.name,
        description: editedProject.description,
        startDate: inputDateToISO(editedProject.startDate),
        dueDate: inputDateToISO(editedProject.dueDate),
        endDate: inputDateToISO(editedProject.endDate),
        members: editedProject.members || []
      };

      await ProjectsService.updateProject(id, updatedData);
      
      // Obtener los datos actualizados del proyecto
      const updatedProject = await ProjectsService.getProjectById(id);
      
      if (!updatedProject) {
        throw new Error('No se pudo obtener el proyecto actualizado');
      }

      // Actualizar el estado con los nuevos datos
      setProject(updatedProject);
      setIsEditing(false);

      // Actualizar también el proyecto editado
      setEditedProject({
        name: updatedProject.name,
        description: updatedProject.description || '',
        startDate: isoToInputDate(updatedProject.startDate),
        dueDate: isoToInputDate(updatedProject.dueDate),
        endDate: isoToInputDate(updatedProject.endDate),
        members: [...(updatedProject.members || [])] // Copia de los miembros
      });

    } catch (err) {
      console.error('Error al guardar cambios:', err);
      setSaveError(err.message || 'Error al guardar cambios');
    } finally {
      setSaveLoading(false);
    }
  };

  // Render condicional
  if (loading) return <div className="text-center p-8">Cargando proyecto...</div>;
  if (error) return <div className="text-red-500 p-8">Error: {error}</div>;
  if (!project) return <div className="p-8">Proyecto no encontrado</div>;

  // Configuración de pestañas
  const tabs = [
    { id: 'details', label: 'Detalles' },
    { id: 'performance', label: 'Rendimiento' },
    { id: 'documents', label: 'Documentos' }
  ];

  // Render principal
  return (
    <div className={`min-h-screen p-4 md:p-6 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/projects')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 w-fit ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              ← Proyectos
            </button>

            {versions.length > 0 && (
              <button 
                onClick={() => navigate(`/projects/${id}/versions`)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 w-fit ${
                  theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                Versiones
              </button>
            )}
          </div>

          <div className="flex flex-col md:items-end">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editedProject.name}
                onChange={handleInputChange}
                className={`text-2xl font-bold mb-1 p-1 rounded ${
                  theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 border'
                }`}
              />
            ) : (
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {project.name} <span className="text-sm font-normal opacity-80">{transformedProject.version}</span>
              </h1>
            )}
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              ID: {id} | Estado: {project.status} | Responsable: {transformedProject.manager}
            </p>
          </div>
        </div>

        <ProjectHeader 
          project={transformedProject} 
          theme={theme}
          isEditing={isEditing}
          editedProject={editedProject}
          onInputChange={handleInputChange}
          users={users}
          onAddMember={handleAddMember}
          onChangeMemberRole={handleChangeMemberRole}
          onRemoveMember={handleRemoveMember}
        />

        {saveError && (
          <div className={`mb-4 p-3 rounded-lg ${
            theme === 'dark' ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-700'
          }`}>
            {saveError}
          </div>
        )}

        <div className={`flex justify-between items-center border-b mb-6 ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm min-w-[120px] text-center ${
                  activeTab === tab.id
                    ? theme === 'dark'
                      ? 'text-blue-400 border-b-2 border-blue-500'
                      : 'text-blue-600 border-b-2 border-blue-600'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={saveLoading}
                  className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                    theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {saveLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : 'Guardar cambios'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar proyecto
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          {activeTab === 'details' && (
            <div className="w-full">
              <ProjectMetrics project={project} theme={theme} />
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