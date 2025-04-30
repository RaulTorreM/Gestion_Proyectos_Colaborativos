import { 
    LuLayoutDashboard, 
    LuFolder, 
    LuMessageSquare, 
    LuSettings, 
    LuUsers, 
    LuShield,
    LuArchive, 
    LuSun,
    LuMoon,
    LuChevronLeft,
    LuChevronRight,
    LuLogOut
  } from 'react-icons/lu';
  import { useState } from 'react';
  import { useTheme } from '../../context/ThemeContext';
  import { NavLink } from 'react-router-dom';
  
  const Sidebar = () => {
    const { theme, toggleTheme } = useTheme();
    const [collapsed, setCollapsed] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    const menuItems = [
      { icon: <LuLayoutDashboard size={20} />, text: 'Dashboard', path: '/' },
      { icon: <LuFolder size={20} />, text: 'Proyectos', path: '/projects' },
      { icon: <LuMessageSquare size={20} />, text: 'Chat', path: '/chat' },
      { icon: <LuArchive size={20}/>, text: 'Analíticas', path: '/analytics' },
      { icon: <LuUsers size={20} />, text: 'Usuarios', path: '/users' },
      { icon: <LuShield size={20} />, text: 'Administración', path: '/admin' },
      { icon: <LuSettings size={20} />, text: 'Configuración', path: '/settings' }
    ];
  
    const toggleCollapse = () => {
      setCollapsed(!collapsed);
    };
  
    const handleUserClick = () => {
      setShowUserMenu(!showUserMenu);
    };
  
    const handleLogout = () => {
      // Aquí iría la lógica para cerrar sesión
      console.log('Cerrando sesión...');
      // Ejemplo: auth.logout();
    };
  
    return (
      <div className={`h-full flex flex-col border-r transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-52'}
        ${theme === 'dark' ? 'bg-black border-gray-700' : 'bg-white border-gray-200'}
        relative
      `}>
        {/* Header con título y botón de colapsar */}
        <div className="p-3 flex items-center justify-between border-b">
          {collapsed ? (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mx-auto">
              <span className="font-bold text-xs">GP</span>
            </div>
          ) : (
            <h1 className={`text-lg font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Gestión Proyectos
            </h1>
          )}
          <button 
            onClick={toggleCollapse}
            className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {collapsed ? (
              <LuChevronRight size={16} className={theme === 'dark' ? 'text-white' : 'text-gray-600'} />
            ) : (
              <LuChevronLeft size={16} className={theme === 'dark' ? 'text-white' : 'text-gray-600'} />
            )}
          </button>
        </div>
  
        {/* Toggle de tema arriba */}
        <div className="p-2 border-b">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-center p-2 rounded-lg
              ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
            `}
            title={theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}
          >
            {theme === 'dark' ? (
              <LuMoon className="text-yellow-300" size={18} />
            ) : (
              <LuSun className="text-yellow-500" size={18} />
            )}
            {!collapsed && (
              <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {theme === 'dark' ? 'Oscuro' : 'Claro'}
              </span>
            )}
          </button>
        </div>
  
        {/* Menú principal */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-4 py-3 mx-2 rounded-lg transition-colors
                ${isActive
                  ? theme === 'dark'
                    ? 'bg-gray-700 text-white'
                    : 'bg-blue-100 text-blue-600'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'}
              `}
            >
              <span className="mr-3">{item.icon}</span>
              {!collapsed && <span>{item.text}</span>}
            </NavLink>
          ))}
        </nav>
  
        {/* Información del usuario abajo */}
        <div className={`p-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div 
            className={`flex items-center p-2 rounded-lg cursor-pointer
              ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            onClick={handleUserClick}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <span className="font-medium text-xs">U</span>
            </div>
            {!collapsed && (
              <div className="ml-2 overflow-hidden">
                <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Usuario Ejemplo
                </p>
                <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Administrador
                </p>
              </div>
            )}
          </div>
  
          {/* Menú desplegable de usuario */}
          {showUserMenu && (
            <div className={`absolute bottom-14 left-2 right-2 mb-2 py-1 rounded-lg shadow-lg
              ${theme === 'dark' ? 'bg-black' : 'bg-white'}
              border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
            >
              <button
                className={`w-full flex items-center px-3 py-2 text-sm rounded
                  ${collapsed ? 'justify-center' : 'justify-start'}
                  text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30`}
                onClick={handleLogout}
              >
                <LuLogOut className={collapsed ? '' : 'mr-2'} size={16} />
                {!collapsed && 'Cerrar sesión'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default Sidebar;
  