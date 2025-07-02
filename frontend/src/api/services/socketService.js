import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentUserId = null;
    this.messageListeners = new Set();
    this.connectionListeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.SOCKET_URL = import.meta.env.VITE_BACKEND_WEBSOCKET_URL || "http://localhost:4000";
  }

  getAccessToken() {
    try {
      let token = localStorage.getItem("accessToken");

      if (!token) {
        token =
          localStorage.getItem("token") ||
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("accessToken") ||
          sessionStorage.getItem("token");
      }

      if (!token || typeof token !== "string") return null;

      if (token === "[object Object]" || token.includes("[object Object]")) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        return null;
      }

      if (token.length < 50) return null;

      return token;
    } catch {
      return null;
    }
  }

  connect(userId) {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected && this.currentUserId === userId) {
        return resolve();
      }

      if (this.socket) {
        this.disconnect();
      }

      const token = this.getAccessToken();
      if (!token) {
        return reject(
          new Error("No se encontró token de autenticación válido")
        );
      }

      const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
      if (!jwtPattern.test(token)) {
        return reject(new Error("Token no tiene formato JWT válido"));
      }

      this.socket = io(this.SOCKET_URL, {
        auth: {
          token,
          userId,
        },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        autoConnect: true,
        forceNew: true,
        timeout: 10000,
        upgrade: true,
      });

      const connectionTimeout = setTimeout(() => {
        if (!this.isConnected) {
          this.socket?.disconnect();
          reject(
            new Error("Timeout al conectar socket después de 10 segundos")
          );
        }
      }, 10000);

      this.socket.on("connect", () => {
        clearTimeout(connectionTimeout);
        this.isConnected = true;
        this.currentUserId = userId;
        this.reconnectAttempts = 0;
        this.socket.emit("join", userId);
        this.notifyConnectionChange(true);
        resolve();
      });

      this.socket.on("disconnect", (reason) => {
        this.isConnected = false;
        this.notifyConnectionChange(false, { reason });
      });

      this.socket.on("connect_error", (error) => {
        clearTimeout(connectionTimeout);
        this.isConnected = false;
        this.reconnectAttempts++;
        this.notifyConnectionChange(false, { error: error.message });

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(
            new Error(
              `No se pudo conectar después de ${this.maxReconnectAttempts} intentos: ${error.message}`
            )
          );
        }
      });

      this.socket.on("receiveMessage", (messageData) => {
        this.notifyMessageListeners(messageData);
      });

      this.socket.on("joinConfirmed", (data) => {
        this.notifyConnectionChange(true, data);
      });

      this.socket.on("joinError", (error) => {
        this.notifyConnectionChange(false, { error });
      });

      this.socket.on("authError", (error) => {
        clearTimeout(connectionTimeout);
        reject(new Error(`Error de autenticación: ${error.message}`));
      });

      this.socket.on("forceDisconnect", () => {
        this.disconnect();
      });

      this.socket.on("messageError", () => {});

      this.socket.on("error", (error) => {
        this.notifyConnectionChange(false, { error });
      });

      this.socket.io.on("reconnect_attempt", () => {
        const updatedToken = this.getAccessToken();
        if (updatedToken && this.socket) {
          this.socket.auth.token = updatedToken;
        }
      });

      this.socket.io.on("reconnect_failed", () => {
        this.notifyConnectionChange(false, { error: "No se pudo reconectar" });
      });

      this.socket.io.on("reconnect", () => {
        if (this.currentUserId) {
          this.socket.emit("join", this.currentUserId);
        }
        this.notifyConnectionChange(true, { reconnected: true });
      });
    });
  }

  notifyMessageListeners(messageData) {
    this.messageListeners.forEach((listener) => {
      try {
        listener(messageData);
      } catch {}
    });
  }

  notifyConnectionChange(connected, data = {}) {
    this.connectionListeners.forEach((listener) => {
      try {
        listener(connected, data);
      } catch {}
    });
  }

  sendMessage(messageData) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error("Socket no conectado"));
        return;
      }

      if (!messageData?.to || !messageData?.content) {
        reject(new Error("Datos de mensaje incompletos"));
        return;
      }

      const messageWithMetadata = {
        ...messageData,
        from: this.currentUserId,
        timestamp: new Date().toISOString(),
      };

      const ackTimeout = setTimeout(() => {
        resolve({ success: true, warning: "ACK timeout" });
      }, 5000);

      this.socket.emit("sendMessage", messageWithMetadata, (ack) => {
        clearTimeout(ackTimeout);
        if (ack?.error) {
          reject(new Error(ack.error));
        } else {
          resolve(ack || { success: true });
        }
      });
    });
  }

  onMessage(callback) {
    this.messageListeners.add(callback);
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  onConnectionChange(callback) {
    this.connectionListeners.add(callback);
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      if (this.socket.io) {
        this.socket.io.removeAllListeners();
      }
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUserId = null;
      this.messageListeners.clear();
      this.connectionListeners.clear();
    }
  }

  get connected() {
    return this.socket?.connected || false;
  }

  get socketId() {
    return this.socket?.id || null;
  }

  get userId() {
    return this.currentUserId;
  }

  getDebugInfo() {
    const token = this.getAccessToken();
    return {
      connected: this.connected,
      socketId: this.socketId,
      userId: this.userId,
      messageListeners: this.messageListeners.size,
      connectionListeners: this.connectionListeners.size,
      hasToken: !!token,
      tokenValid: token && typeof token === "string" && token.length > 50,
      tokenPreview: token ? token.substring(0, 30) + "..." : null,
      socketUrl: this.SOCKET_URL,
      socketExists: !!this.socket,
      engineConnected: this.socket?.io?.engine?.readyState === "open",
    };
  }

  debugToken() {}

  debugConnection() {}
}

const socketService = new SocketService();
export default socketService;
