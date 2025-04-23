// src/components/dashboard/TasksCompletedChart.jsx
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS } from 'chart.js/auto'

export default function TasksCompletedChart() {
  const data = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
    datasets: [{
      label: 'Tareas Completadas',
      data: [12, 19, 15, 28, 24, 32],
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 2,
      tension: 0.3,
      fill: true,
      pointBackgroundColor: 'rgba(16, 185, 129, 1)',
      pointBorderColor: '#fff',
      pointRadius: 5,
      pointHoverRadius: 7
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
        titleColor: '#10b981',
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
        <h3 className="text-xl font-semibold text-white">Tareas Completadas</h3>
        <span className="text-sm text-green-400">+35%</span>
      </div>
      <div className="h-72">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}