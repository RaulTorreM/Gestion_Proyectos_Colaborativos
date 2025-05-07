import { createContext, useContext } from 'react';
import AuthService from '../api/services/authService'; // Ajusta si tu ruta es diferente

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider value={AuthService}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para acceder al AuthContext
export const useAuth = () => useContext(AuthContext);
