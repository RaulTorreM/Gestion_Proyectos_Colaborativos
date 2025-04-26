// src/components/dashboard/ProjectProgressChart.jsx
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS } from 'chart.js/auto'

export default function ProjectProgressChart() {
  const data = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Progreso',
      data: [65, 59, 80, 81, 56, 55],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      borderRadius: 6
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'white',
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#3b82f6',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        usePointStyle: true
      }
    }
  }

  return (
    <div className="bg-black border border-gray-800 rounded-xl p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Progreso de Proyectos</h3>
        <span className="text-sm text-blue-400">2025</span>
      </div>
      <div className="h-72">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}