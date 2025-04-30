// src/pages/Dashboard.jsx
import StatsGrid from '../components/dashboard/StatsGrid';
import ProjectProgress from '../components/dashboard/ProjectProgress';
import TaskDistribution from '../components/dashboard/TaskDistribution';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const { theme } = useTheme();

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Dashboard
        </h1>
      </div>

      {/* Grid de estadísticas */}
      <StatsGrid />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[350px]">
          <ProjectProgress />
        </div>
        <div className="h-[350px]">
          <TaskDistribution />
        </div>
      </div>

      {/* Comentario para el desarrollador backend */}
      {/* 
        Estructura esperada para la API:
        - GET /api/dashboard/stats -> Devuelve { activeProjects, pendingTasks, completedTasks, teamMembers }
        - GET /api/dashboard/project-progress -> Devuelve { active, paused, completed, planned, cancelled }
        - GET /api/dashboard/task-distribution -> Devuelve { completed, inProgress, pending }
      */}
    </div>
  );
};

export default Dashboard;