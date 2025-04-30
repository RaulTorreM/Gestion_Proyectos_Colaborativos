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

  const data = {
    labels: ['Activo', 'En pausa', 'Completado', 'Planificado', 'Cancelado'],
    datasets: [
      {
        label: 'Proyectos',
        data: [10, 8, 4, 2, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

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
        text: 'Progreso de Proyectos',
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
          stepSize: 2
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
      <Bar data={data} options={options} />
    </div>
  );
};

export default ProjectProgress;