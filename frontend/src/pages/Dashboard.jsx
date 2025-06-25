// src/pages/Dashboard.jsx
import StatsGrid from '../components/dashboard/StatsGrid';
import ProjectProgress from '../components/dashboard/ProjectProgress';
import TaskDistribution from '../components/dashboard/TaskDistribution';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const { theme } = useTheme();

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Encabezado del Dashboard */}
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Dashboard
        </h1>
      </div>

      {/* 
        Grid de estadísticas principales 
        Muestra: Proyectos activos, tareas pendientes, tareas completadas y miembros del equipo
        - Usa el componente StatsGrid que hace 3 llamadas API:
          1. /api/projects/count-active -> cuenta proyectos activos
          2. /api/user-stories/count-by-status -> cuenta tareas por estado
          3. /api/users/count -> cuenta usuarios registrados
      */}
      <StatsGrid />

      {/* 
        Sección de gráficos 
        - Diseño responsive: se apilan en móvil, se colocan lado a lado en desktop
        - Altura fija para consistencia visual
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 
          Gráfico de barras que muestra el progreso de los proyectos
          - Usa el componente ProjectProgress que consume:
            /api/projects/status-count -> cuenta proyectos por estado
          - Estados mostrados: No iniciado, En Progreso, Finalizado
          - Se adapta al tema claro/oscuro
        */}
        <div className="h-[350px]">
          <ProjectProgress />
        </div>

        {/* 
          Gráfico de pie que muestra la distribución de tareas
          - Usa el componente TaskDistribution que consume:
            /api/user-stories/count-by-status -> misma API que StatsGrid
          - Estados mostrados: Pendiente, En Progreso, Completado
          - Se adapta al tema claro/oscuro
        */}
        <div className="h-[350px]">
          <TaskDistribution />
        </div>
      </div>

      {/* 
        Documentación para el equipo backend
        ------------------------------------------------------------
        Endpoints esperados para el funcionamiento completo del dashboard:

        1. Estadísticas principales (StatsGrid):
        GET /api/projects/count-active
        Respuesta esperada: { count: number }

        GET /api/user-stories/count-by-status
        Respuesta esperada: { 
          "Pendiente": number,
          "En Progreso": number, 
          "Completado": number 
        }

        GET /api/users/count
        Respuesta esperada: { count: number }

        2. Progreso de proyectos (ProjectProgress):
        GET /api/projects/status-count
        Respuesta esperada: {
          "No iniciado": number,
          "En Progreso": number,
          "Finalizado": number
        }

        3. Distribución de tareas (TaskDistribution):
        Mismo endpoint que StatsGrid para las tareas:
        GET /api/user-stories/count-by-status

      */}
    </div>
  );
};

export default Dashboard;