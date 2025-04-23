// src/components/common/StatCard.jsx
export default function StatCard({ title, value, secondaryText, icon }) {
    return (
      <div className="bg-black border border-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="bg-gray-900 p-3 rounded-lg text-white">
            {icon}
          </div>
          <div>
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            <p className="text-gray-500 text-sm mt-2">{secondaryText}</p>
          </div>
        </div>
      </div>
    )
  }