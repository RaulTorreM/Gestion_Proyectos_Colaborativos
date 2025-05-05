// src/components/dashboard/ProjectProgress.jsx
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { useEffect, useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProjectProgress = () => {
  const { theme } = useTheme();
  const [projectData, setProjectData] = useState({
    labels: ['No iniciado', 'En Progreso', 'Finalizado'],
    datasets: [{ data: [0, 0, 0] }]
  });

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await axios.get('/api/projects/status-count');
        const statusCounts = response.data;
        
        setProjectData({
          labels: ['No iniciado', 'En Progreso', 'Finalizado'],
          datasets: [{
            label: 'Proyectos',
            data: [
              statusCounts['No iniciado'] || 0,
              statusCounts['En Progreso'] || 0,
              statusCounts['Finalizado'] || 0
            ],
            backgroundColor: [
              'rgba(153, 102, 255, 0.7)', // No iniciado
              'rgba(255, 206, 86, 0.7)',   // En Progreso
              'rgba(75, 192, 192, 0.7)'    // Finalizado
            ],
            borderColor: [
              'rgba(153, 102, 255, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1,
          }]
        });
      } catch (error) {
        console.error('Error fetching project status data:', error);
      }
    };

    fetchProjectData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#fff' : '#333',
        },
      },
      title: {
        display: true,
        text: 'Estado de Proyectos',
        color: theme === 'dark' ? '#fff' : '#333',
        font: {
          size: 14
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: theme === 'dark' ? '#fff' : '#333',
          stepSize: 1
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          color: theme === 'dark' ? '#fff' : '#333',
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div className={`
      rounded-xl p-4 shadow-sm h-full
      ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}
    `}>
      <Bar data={projectData} options={options} />
    </div>
  );
};

export default ProjectProgress; 