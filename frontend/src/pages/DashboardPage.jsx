// src/pages/DashboardPage.jsx
import StatCard from '../components/common/StatCard'
import { 
  FiFolder, 
  FiCheckCircle, 
  FiList, 
  FiUsers as FiTeam 
} from 'react-icons/fi'
import ProjectProgressChart from '../components/dashboard/ProjectProgressChart'
import TasksCompletedChart from '../components/dashboard/TasksCompletedChart'


export default function DashboardPage() {
  const stats = [
    {
      title: "Proyectos Activos",
      value: 3,
      secondaryText: "+2 este mes",
      icon: <FiFolder size={24} className="text-white" />,
      color: "primary"
    },
    {
      title: "Tareas Pendientes",
      value: 42,
      secondaryText: "8 con alta prioridad",
      icon: <FiList size={24} className="text-white" />,
      color: "secondary"
    },
    {
      title: "Tareas Completadas",
      value: 128,
      secondaryText: "+28 esta semana",
      icon: <FiCheckCircle size={24} className="text-white" />,
      color: "secondary"
    },
    {
      title: "Miembros del Equipo",
      value: 24,
      secondaryText: "En 8 proyectos",
      icon: <FiTeam size={24} className="text-white" />,
      color: "primary"
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold border-b border-gray-700 pb-4">Bienvenido a tu panel de gestión</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border-t border-gray-700 pt-6">
        <ProjectProgressChart />
        <TasksCompletedChart />
      </div>
    </div>
  )
}