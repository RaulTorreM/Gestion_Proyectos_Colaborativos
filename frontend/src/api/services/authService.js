import api from "../axiosInstance";

const AuthService = {
  // Login: recibe credenciales y maneja respuesta
  login: async (credentials) => {
    try {
      // 🔥 IMPORTANTE: Destructurar correctamente la respuesta
      const response = await api.post("/login", credentials);

      // 🔥 CORREGIDO: Verificar si response.data existe y extraer tokens correctamente
      const data = response.data || response;
      const { accessToken, refreshToken } = data;

      console.log("🔍 Respuesta del login:", {
        data,
        accessToken: typeof accessToken,
        refreshToken: typeof refreshToken,
      });

      // 🔥 IMPORTANTE: Verificar que los tokens sean strings antes de guardar
      if (!accessToken || typeof accessToken !== "string") {
        throw new Error("Token de acceso inválido recibido del servidor");
      }

      if (!refreshToken || typeof refreshToken !== "string") {
        throw new Error("Token de refresh inválido recibido del servidor");
      }

      // Guarda los tokens en localStorage como strings
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      console.log("✅ Tokens guardados correctamente:", {
        accessTokenType: typeof accessToken,
        refreshTokenType: typeof refreshToken,
        accessTokenPreview: accessToken.substring(0, 20) + "...",
      });

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("❌ Error en login:", error);
      throw error;
    }
  },

  // Obtiene los datos del usuario autenticado actual usando su accessToken
  getLoggedUser: async () => {
    try {
      // 🔥 CORREGIDO: Manejar la respuesta correctamente
      const response = await api.get("/logged");
      const loggedUser = response.data || response;

      // console.log("✅ Usuario logueado obtenido:", loggedUser);
      return loggedUser;
    } catch (error) {
      // Usuario no autenticado
      console.error(`❌ Error fetching current logged user: `, error);
      AuthService.clearSession();
      window.location.href = "/login";
      throw error;
    }
  },

  // Logout: envía refresh token, limpia localStorage
  logout: async () => {
    try {
      const refreshToken = AuthService.getRefreshToken();
      if (refreshToken) {
        await api.post("/logout", { refreshToken: refreshToken });
      }
      AuthService.clearSession();
    } catch (error) {
      console.error("❌ Error en logout:", error);
      // Igual limpia sesión por seguridad
      AuthService.clearSession();
    }
  },

  // 🔥 CORREGIDO: Método mejorado para obtener el access token
  getAccessToken: () => {
    try {
      const token = localStorage.getItem("accessToken");

      // 🔥 IMPORTANTE: Verificar que sea un string válido
      if (!token || typeof token !== "string") {
        console.warn(
          "⚠️ Token de acceso no válido en localStorage:",
          typeof token
        );
        return null;
      }

      // 🔥 VERIFICACIÓN ADICIONAL: Si por alguna razón es "[object Object]", limpiar
      if (token === "[object Object]" || token.includes("[object Object]")) {
        console.error("❌ Token corrupto detectado, limpiando sesión");
        AuthService.clearSession();
        return null;
      }

      return token;
    } catch (error) {
      console.error("❌ Error obteniendo access token:", error);
      return null;
    }
  },

  // 🔥 CORREGIDO: Método mejorado para obtener el refresh token
  getRefreshToken: () => {
    try {
      const token = localStorage.getItem("refreshToken");

      if (!token || typeof token !== "string") {
        console.warn(
          "⚠️ Refresh token no válido en localStorage:",
          typeof token
        );
        return null;
      }

      if (token === "[object Object]" || token.includes("[object Object]")) {
        console.error("❌ Refresh token corrupto detectado, limpiando sesión");
        AuthService.clearSession();
        return null;
      }

      return token;
    } catch (error) {
      console.error("❌ Error obteniendo refresh token:", error);
      return null;
    }
  },

  // 🔥 MEJORADO: Limpieza más exhaustiva
  clearSession: () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // 🔥 NUEVO: Limpiar también posibles variaciones del nombre
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      console.log("🧹 Sesión limpiada completamente");
    } catch (error) {
      console.error("❌ Error limpiando sesión:", error);
    }
  },

  // 🔥 NUEVO: Método para debug de tokens
  debugTokens: () => {
    console.log("🔍 === DEBUG TOKENS ===");

    const locations = [
      "accessToken",
      "refreshToken",
      "token",
      "access_token",
      "refresh_token",
    ];

    locations.forEach((key) => {
      const value = localStorage.getItem(key);
      console.log(`📍 localStorage.${key}:`, {
        exists: !!value,
        type: typeof value,
        value: value,
        isValidString: typeof value === "string" && value.length > 10,
        preview: value
          ? typeof value === "string"
            ? value.substring(0, 30) + "..."
            : value
          : null,
      });
    });

    console.log("====================");
  },
};

export default AuthService;
