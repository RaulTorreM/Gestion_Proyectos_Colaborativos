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
import { useState, useEffect } from 'react';
import MetricsService from '../../../api/services/metricsService';

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
  const [metrics, setMetrics] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        const metricsData = await MetricsService.getProjectMetrics(project._id);
        const progressData = await MetricsService.getWeeklyProgress(project._id);
        
        setMetrics(metricsData);
        setWeeklyProgress(progressData);
      } catch (err) {
        console.error('Error loading metrics:', err);
        setError(err.message || 'Error al cargar métricas');
      } finally {
        setLoading(false);
      }
    };

    if (project._id) {
      fetchMetrics();
    }
  }, [project._id]);

  // Datos para el gráfico de progreso semanal
  const weeklyProgressData = {
    labels: weeklyProgress?.weeks || [],
    datasets: [
      {
        label: 'Historias de usuario completadas',
        data: weeklyProgress?.completedTasks || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  // Datos para el gráfico de métricas
  const metricsData = {
    labels: ['Progreso general', 'Entregas a tiempo'],
    datasets: [
      {
        label: 'Actual',
        data: [
          metrics?.progress || 0,
          metrics?.deliveries?.actual || 0
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Objetivo',
        data: [
          metrics?.progressTarget || 85,
          metrics?.deliveries?.target || 90
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

  if (loading) {
    return (
      <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
        <div className="flex justify-center items-center h-64">
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Cargando métricas...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-700'}`}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
        <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Progreso Semanal - {project.name}
        </h3>
        <div className="h-64">
          {weeklyProgress?.completedTasks?.length > 0 ? (
            <Line 
              data={weeklyProgressData} 
              options={options}
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                No hay datos de progreso semanal disponibles
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
        <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Métricas Clave - {project.name}
        </h3>
        <div className="h-64">
          {metrics ? (
            <Bar 
              data={metricsData} 
              options={options}
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                No hay métricas disponibles
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={`rounded-xl p-4 shadow-sm ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
        <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Datos no disponibles en tu BD actual
        </h3>
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <p className={`mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Según el esquema de BD en mermaidchart, no hay información sobre:
          </p>
          <ul className={`list-disc pl-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>Asistencia a reuniones</li>
            <li>Cobertura de pruebas</li>
            <li>Documentación completada</li>
          </ul>
          <p className={`mt-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Se podría agregar estas colecciones... o eliminar estas partes...
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectMetrics;