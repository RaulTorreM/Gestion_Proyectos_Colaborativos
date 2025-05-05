// src/components/dashboard/TaskDistribution.jsx
import { Pie } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { useEffect, useState } from 'react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const TaskDistribution = () => {
  const { theme } = useTheme();
  const [taskData, setTaskData] = useState({
    labels: ['Pendiente', 'En Progreso', 'Completado'],
    datasets: [{
      data: [0, 0, 0]
    }]
  });

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const response = await axios.get('/api/user-stories/count-by-status');
        const statusCounts = response.data;
        
        setTaskData({
          labels: ['Pendiente', 'En Progreso', 'Completado'],
          datasets: [{
            label: 'Tareas',
            data: [
              statusCounts['Pendiente'] || 0,
              statusCounts['En Progreso'] || 0,
              statusCounts['Completado'] || 0
            ],
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',  // Pendiente
              'rgba(255, 206, 86, 0.7)',   // En Progreso
              'rgba(75, 192, 192, 0.7)'    // Completado
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1,
          }]
        });
      } catch (error) {
        console.error('Error al obtener datos de distribución de tareas:', error);
      }
    };

    fetchTaskData();
  }, []);

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
        text: 'Distribución de Historias de Usuario',
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
      <Pie data={taskData} options={options} />
    </div>
  );
};

export default TaskDistribution;