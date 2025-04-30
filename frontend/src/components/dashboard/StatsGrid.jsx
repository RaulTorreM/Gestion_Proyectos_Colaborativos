// src/components/dashboard/StatsGrid.jsx
import { LuFolder, LuClipboardList, LuChartPie, LuUsers } from 'react-icons/lu';
import StatsCard from './StatsCard';
import { useTheme } from '../../context/ThemeContext';

const StatsGrid = () => {
  const { theme } = useTheme();

  const statsData = [
    {
      title: "Proyectos Activos",
      value: "3",
      change: "+2 este mes",
      icon: <LuFolder size={24} />
    },
    {
      title: "Tareas Pendientes",
      value: "42",
      change: "8 con alta prioridad",
      icon: <LuClipboardList size={24} />
    },
    {
      title: "Tareas Completadas",
      value: "128",
      change: "+28 esta semana",
      icon: <LuChartPie size={24} />
    },
    {
      title: "Miembros del Equipo",
      value: "24",
      change: "En 8 proyectos",
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