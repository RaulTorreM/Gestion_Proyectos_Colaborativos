// src/components/dashboard/TaskDistribution.jsx
import { Pie } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const TaskDistribution = () => {
  const { theme } = useTheme();

  const data = {
    labels: ['Completadas', 'En progreso', 'Pendientes'],
    datasets: [
      {
        label: 'Tareas',
        data: [128, 42, 56],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
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
        position: 'right',
        labels: {
          color: theme === 'dark' ? '#fff' : '#333',
          padding: 20,
          boxWidth: 12,
          font: {
            size: 12
          }
        },
      },
      title: {
        display: true,
        text: 'Distribución de Tareas',
        color: theme === 'dark' ? '#fff' : '#333',
        font: {
          size: 14
        }
      },
    },
  };

  return (
    <div className={`
      rounded-xl p-4 shadow-sm h-full
      ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}
    `}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default TaskDistribution;