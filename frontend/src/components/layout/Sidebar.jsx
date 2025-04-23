import { useState } from 'react'
import { 
  FiHome, 
  FiFolder, 
  FiCheckSquare, 
  FiMessageSquare, 
  FiPieChart, 
  FiUsers, 
  FiSettings,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'
import NavItem from './NavItem'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`bg-black text-white h-full flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Encabezado con altura fija igual a TopBar (h-16) */}
      <div className="flex items-center justify-between border-b border-gray-800 h-16 px-4">
        {collapsed ? (
          <div className="flex items-center justify-center h-full"> {/* Contenedor para centrar verticalmente */}
            <span className="text-xl font-bold">P2</span>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full"> {/* Contenedor para centrar verticalmente */}
            <span className="text-xl font-bold">Proyectos2</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-300 hover:text-white p-1"
        >
          {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>

      {/* Resto del sidebar permanece igual */}
      <div className="flex-1 overflow-y-auto p-2">
        <nav className="space-y-1">
          <NavItem icon={<FiHome />} text="Dashboard" to="/dashboard" collapsed={collapsed} />
          <NavItem icon={<FiFolder />} text="Proyectos" to="/projects" collapsed={collapsed} />
          <NavItem icon={<FiCheckSquare />} text="Tareas" to="/tasks" collapsed={collapsed} />
          <NavItem icon={<FiMessageSquare />} text="Chat" to="/chat" collapsed={collapsed} />
          <NavItem icon={<FiPieChart />} text="Analíticas" to="/analytics" collapsed={collapsed} />
          <NavItem icon={<FiUsers />} text="Usuarios" to="/users" collapsed={collapsed} />
          <NavItem icon={<FiSettings />} text="Configuración" to="/settings" collapsed={collapsed} />
        </nav>
      </div>
    </div>
  )
}