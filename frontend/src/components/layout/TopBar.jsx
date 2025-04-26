// src/components/layout/TopBar.jsx
import { useState } from 'react'
import { FiMenu, FiLogOut } from 'react-icons/fi'

export default function TopBar() {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    // Lógica para cerrar sesión
    console.log('Sesión cerrada')
    setShowDropdown(false)
    // Redirigir al login u otras acciones necesarias
  }

  return (
    <header className="bg-black border-b border-gray-800 h-16 flex items-center">
      <div className="flex items-center justify-between w-full px-6">
        {/* Botón de menú para móviles - alineado con el centro del logo */}
        <button className="text-gray-300 hover:text-white md:hidden h-full flex items-center px-4 -ml-4">
          <FiMenu size={20} />
        </button>

        {/* Espacio para alinear con el logo del sidebar */}
        <div className="hidden md:block w-64 pl-4">
          {/* Espacio vacío que coincide con el ancho del sidebar */}
        </div>

        {/* Espacio flexible central */}
        <div className="flex-1"></div>

        {/* Perfil de usuario - alineado verticalmente */}
        <div className="relative h-full flex items-center">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white h-full px-4"
          >
            <img 
              src={`${import.meta.env.VITE_AVATAR_BASE_PATH}default-avatar.jpg`} 
              alt="Usuario" 
              className="w-8 h-8 rounded-full border border-gray-600"
            />
            <span className="hidden md:inline">Usuario Prueba</span>
          </button>

          {/* Dropdown para cerrar sesión */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-0 w-48 bg-gray-900 rounded-md shadow-lg border border-gray-800 z-50">
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-sm text-white">Usuario Prueba</p>
                <p className="text-xs text-gray-400">Administrador</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-b-md"
              >
                <FiLogOut className="mr-2" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}