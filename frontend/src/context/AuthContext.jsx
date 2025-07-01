import { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../api/services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para verificar y cargar el usuario actual
  const loadUser = async () => {
    try {
      setLoading(true);
      const token = AuthService.getAccessToken();

      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Obtener datos del usuario logueado
      const userData = await AuthService.getLoggedUser();
      setUser(userData);
      setIsAuthenticated(true);
      // console.log("✅ Usuario cargado:", userData);
    } catch (error) {
      console.error("❌ Error cargando usuario:", error);
      // Si hay error, limpiar sesión
      AuthService.clearSession();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuario al inicializar
  useEffect(() => {
    loadUser();
  }, []);

  // Función de login mejorada
  const login = async (credentials) => {
    try {
      setLoading(true);
      const tokens = await AuthService.login(credentials);

      // Después del login exitoso, cargar datos del usuario
      await loadUser();

      return tokens;
    } catch (error) {
      console.error("❌ Error en login:", error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función de logout mejorada
  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("❌ Error en logout:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      AuthService.clearSession();
    }
  };

  const contextValue = {
    // Estado del usuario
    user,
    loading,
    isAuthenticated,

    // Funciones de autenticación
    login,
    logout,
    loadUser,

    // Funciones del AuthService
    getAccessToken: AuthService.getAccessToken,
    getRefreshToken: AuthService.getRefreshToken,
    clearSession: AuthService.clearSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Hook personalizado para acceder al AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
