// src/components/dashboard/StatsGrid.jsx
import { LuFolder, LuClipboardList, LuChartPie, LuUsers } from 'react-icons/lu';
import StatsCard from './StatsCard';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { useEffect, useState } from 'react';

const StatsGrid = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [projectsRes, tasksRes, membersRes] = await Promise.all([
          axios.get('/api/projects/count-active'),
          axios.get('/api/user-stories/count-by-status'),
          axios.get('/api/users/count')
        ]);

        setStats({
          activeProjects: projectsRes.data?.count || 0,
          pendingTasks: tasksRes.data?.['En Progreso'] || 0,
          completedTasks: tasksRes.data?.['Completado'] || 0,
          teamMembers: membersRes.data?.count || 0
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message);
        // Coloca (0)) por defecto en caso de error...
        setStats({
          activeProjects: 0,
          pendingTasks: 0,
          completedTasks: 0,
          teamMembers: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className={`rounded-xl p-5 shadow-sm h-full ${
            theme === 'dark' ? 'bg-zinc-900' : 'bg-white'
          }`}>
            <div className="animate-pulse flex justify-between items-start h-full">
              <div className="space-y-3">
                <div className={`h-4 w-24 rounded ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
                <div className={`h-8 w-16 rounded ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
                <div className={`h-3 w-32 rounded ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
              </div>
              <div className={`h-10 w-10 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl p-4 ${
        theme === 'dark' ? 'bg-zinc-900 text-red-400' : 'bg-white text-red-600'
      }`}>
        Error loading stats: {error}
      </div>
    );
  }

  const statsData = [
    {
      title: "Proyectos Activos",
      value: stats?.activeProjects?.toString() || "0",
      change: "En progreso",
      icon: <LuFolder size={24} />
    },
    {
      title: "Tareas Pendientes",
      value: stats?.pendingTasks?.toString() || "0",
      change: "Por completar",
      icon: <LuClipboardList size={24} />
    },
    {
      title: "Tareas Completadas",
      value: stats?.completedTasks?.toString() || "0",
      change: "Finalizadas",
      icon: <LuChartPie size={24} />
    },
    {
      title: "Miembros del Equipo",
      value: stats?.teamMembers?.toString() || "0",
      change: "Colaborando",
      icon: <LuUsers size={24} />
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          theme={theme}
        />
      ))}
    </div>
  );
};

export default StatsGrid;