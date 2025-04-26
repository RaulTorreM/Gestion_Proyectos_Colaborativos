// src/components/layout/UserProfile.jsx
export default function UserProfile({ collapsed }) {
    return (
      <div className={`p-4 ${collapsed ? 'px-2' : ''}`}>
        <div className={`flex ${collapsed ? 'flex-col items-center space-y-2' : 'items-center space-x-3'}`}>
          <img 
            src={`${import.meta.env.VITE_AVATAR_BASE_PATH}default-avatar.jpg`} 
            alt="Usuario" 
            className="w-10 h-10 rounded-full border-2 border-gray-700"
          />
          {!collapsed && (
            <div>
              <p className="font-medium text-white">Usuario Prueba</p>
              <p className="text-xs text-gray-400">Administrador</p>
            </div>
          )}
        </div>
      </div>
    )
  }