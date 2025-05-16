import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance'; // Ruta relativa corregida

// Registrar componentes de ChartJS
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const ProjectPerformance = ({ project, theme }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/projects/${project._id}/performance`);
        
        // Si el backend devuelve un warning (colección no implementada)
        if (response.data.warning) {
          throw new Error(response.data.warning);
        }

        setPerformanceData(response.data);
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError(err.message || 'Error al cargar datos de rendimiento');
        
        // Datos simulados de respaldo
        setPerformanceData({
          labels: ['Productividad', 'Calidad', 'Colaboración', 'Puntualidad', 'Innovación'],
          datasets: [{
            data: [85, 78, 92, 80, 65],
          }],
          lastUpdated: new Date()
        });
      } finally {
        setLoading(false);
      }
    };

    if (project?._id) {
      fetchPerformanceData();
    }
  }, [project._id]);

  if (loading) {
    return (
      <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
        <div className="flex justify-center items-center h-96">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Cargando datos de rendimiento...
          </span>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: performanceData?.labels || [],
    datasets: [
      {
        label: 'Rendimiento del Equipo',
        data: performanceData?.datasets?.[0]?.data || [],
        backgroundColor: theme === 'dark' 
          ? 'rgba(59, 130, 246, 0.2)' 
          : 'rgba(59, 130, 246, 0.2)',
        borderColor: theme === 'dark' 
          ? 'rgba(59, 130, 246, 0.8)' 
          : 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: theme === 'dark' 
          ? 'rgba(59, 130, 246, 1)' 
          : 'rgba(59, 130, 246, 1)',
        pointBorderColor: theme === 'dark' ? '#1e293b' : '#fff',
        pointHoverRadius: 6,
        pointRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          circular: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        pointLabels: {
          color: theme === 'dark' ? '#e2e8f0' : '#334155',
          font: {
            size: 12,
            weight: '500'
          }
        },
        ticks: {
          backdropColor: 'transparent',
          color: theme === 'dark' ? '#94a3b8' : '#64748b',
          stepSize: 20,
          showLabelBackdrop: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#e2e8f0' : '#334155',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
        titleColor: theme === 'dark' ? '#e2e8f0' : '#334155',
        bodyColor: theme === 'dark' ? '#cbd5e1' : '#475569',
        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw}%`;
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.1
      }
    }
  };

  return (
    <div className={`rounded-xl p-6 shadow-lg border ${theme === 'dark' 
      ? 'bg-zinc-900 border-gray-700' 
      : 'bg-white border-gray-200'}`}>
      
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
          Rendimiento del Equipo
        </h3>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
          {project.status}
        </div>
      </div>
      
      {error && (
        <div className={`mb-4 p-3 rounded-lg ${
          theme === 'dark' ? 'bg-yellow-900/20 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
          <p>{error}</p>
          <p className="text-sm mt-1">Mostrando datos de ejemplo</p>
        </div>
      )}
      
      <div className="relative h-96 w-full">
        <Radar 
          data={chartData} 
          options={chartOptions} 
          className="w-full h-full"
        />
      </div>
      
      <div className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>Última actualización: {performanceData?.lastUpdated ? new Date(performanceData.lastUpdated).toLocaleDateString() : 'N/A'}</p>
        {error && (
          <p className="mt-1 text-xs italic">
            Nota: Para métricas reales, implemente la colección TEAM_PERFORMANCE en el backend.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectPerformance;