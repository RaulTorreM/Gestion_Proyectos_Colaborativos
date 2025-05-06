// src/pages/projects/ProjectDetails/ProjectMetrics.jsx
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProjectMetrics = ({ project = {}, theme = 'light' }) => {
  // TODO: Reemplazar con datos reales del backend cuando esté disponible
  // Estos son datos simulados específicos para cada proyecto basados en mockProjects
  const getSimulatedMetrics = (projectId) => {
    switch(projectId) {
      case "681a8c77a76349ebccb013d8": // Sistema de Gestión
        return {
          meetings: { actual: 85, target: 90 },
          deliveries: { actual: 78, target: 85 },
          tests: { actual: 92, target: 95 },
          documentation: { actual: 65, target: 80 },
          weeklyProgress: [50, 80, 60, 90, 70, 60] // Tareas por semana
        };
      case 2: // Portal Clientes
        return {
          meetings: { actual: 75, target: 85 },
          deliveries: { actual: 68, target: 80 },
          tests: { actual: 85, target: 90 },
          documentation: { actual: 55, target: 75 },
          weeklyProgress: [3, 5, 7, 6, 4, 8]
        };
      case 3: // App Móvil
        return {
          meetings: { actual: 65, target: 80 },
          deliveries: { actual: 45, target: 70 },
          tests: { actual: 60, target: 85 },
          documentation: { actual: 40, target: 60 },
          weeklyProgress: [2, 3, 1, 4, 2, 3]
        };
      case 4: // Migración BD
        return {
          meetings: { actual: 95, target: 95 },
          deliveries: { actual: 90, target: 90 },
          tests: { actual: 98, target: 95 },
          documentation: { actual: 85, target: 85 },
          weeklyProgress: [8, 10, 12, 15, 18, 20]
        };
      default:
        return {
          meetings: { actual: 0, target: 0 },
          deliveries: { actual: 0, target: 0 },
          tests: { actual: 0, target: 0 },
          documentation: { actual: 0, target: 0 },
          weeklyProgress: [0, 0, 0, 0, 0, 0]
        };
    }
  };

  // Obtenemos métricas simuladas para este proyecto
  const simulatedMetrics = getSimulatedMetrics(project.id);

  // Datos para el gráfico de progreso semanal
  const weeklyProgressData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
    datasets: [
      {
        label: 'Tareas completadas',
        data: simulatedMetrics.weeklyProgress,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  // Datos para el gráfico de métricas
  const metricsData = {
    labels: ['Tareas completadas', 'Asistencia reuniones', 'Entregas a tiempo', 'Cobertura pruebas', 'Documentación'],
    datasets: [
      {
        label: 'Actual',
        data: [
          project.progress || 0, // Usamos el progreso general del proyecto
          simulatedMetrics.meetings.actual,
          simulatedMetrics.deliveries.actual,
          simulatedMetrics.tests.actual,
          simulatedMetrics.documentation.actual
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Objetivo',
        data: [
          85, // Objetivo tareas completadas (%)
          simulatedMetrics.meetings.target,
          simulatedMetrics.deliveries.target,
          simulatedMetrics.tests.target,
          simulatedMetrics.documentation.target
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#fff' : '#333',
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: theme === 'dark' ? '#fff' : '#333',
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#333',
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* TODO: Reemplazar con datos reales del backend */}
      {/* Actualmente usando datos simulados específicos para cada proyecto */}
      
      <div className={`
        rounded-xl p-4 shadow-sm
        ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}
      `}>
        <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Progreso Semanal - {project.title}
        </h3>
        <div className="h-64">
          <Line 
            data={weeklyProgressData} 
            options={options}
          />
        </div>
      </div>

      <div className={`
        rounded-xl p-4 shadow-sm
        ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}
      `}>
        <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Métricas del Proyecto - {project.title}
        </h3>
        <div className="h-64">
          <Bar 
            data={metricsData} 
            options={options}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectMetrics;