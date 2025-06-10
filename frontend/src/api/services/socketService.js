import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentUserId = null;
    this.messageListeners = new Set();
    this.connectionListeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Inicializar conexión
  connect(userId) {
    return new Promise((resolve, reject) => {
      // Si ya está conectado para el mismo usuario, no hacer nada
      if (this.socket && this.isConnected && this.currentUserId === userId) {
        console.log('🔗 Socket ya conectado para usuario:', userId);
        return resolve();
      }

      // Desconectar socket anterior si existe
      if (this.socket) {
        this.disconnect();
      }

      console.log('🚀 Iniciando conexión socket para usuario:', userId);
      
      this.socket = io('http://localhost:4000', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        autoConnect: true,
        query: { userId }
      });

      // Configurar event listeners
      this.socket.on('connect', () => {
        console.log('✅ Socket conectado:', this.socket.id);
        this.isConnected = true;
        this.currentUserId = userId;
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket desconectado:', reason);
        this.isConnected = false;
        this.notifyConnectionChange(false);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión:', error.message);
        this.isConnected = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error(`No se pudo conectar después de ${this.maxReconnectAttempts} intentos`));
        }
      });

      this.socket.on('receiveMessage', (messageData) => {
        console.log('📨 Mensaje recibido:', messageData);
        this.notifyMessageListeners(messageData);
      });

      this.socket.on('messageDelivered', (data) => {
        console.log('✅ Mensaje entregado:', data);
      });

      this.socket.on('joinConfirmed', (data) => {
        console.log('🏠 Unión a sala confirmada:', data);
        this.notifyConnectionChange(true);
      });
    });
  }

  // Notificar a los listeners de mensajes
  notifyMessageListeners(messageData) {
    this.messageListeners.forEach(listener => {
      try {
        listener(messageData);
      } catch (error) {
        console.error('Error en message listener:', error);
      }
    });
  }

  // Notificar a los listeners de conexión
  notifyConnectionChange(connected, data = {}) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected, data);
      } catch (error) {
        console.error('Error en connection listener:', error);
      }
    });
  }

  // Enviar mensaje
  sendMessage(messageData) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket no conectado'));
        return;
      }

      console.log('📤 Enviando mensaje via socket:', messageData);
      this.socket.emit('sendMessage', messageData, (ack) => {
        if (ack && ack.success) {
          resolve(ack);
        } else {
          reject(ack?.error || 'Error al enviar mensaje');
        }
      });
    });
  }

  // Agregar listener para mensajes
  onMessage(callback) {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  // Agregar listener para cambios de conexión
  onConnectionChange(callback) {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }

  // Desconectar
  disconnect() {
    if (this.socket) {
      console.log('🔌 Desconectando socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUserId = null;
      this.messageListeners.clear();
      this.connectionListeners.clear();
    }
  }

  // Getters
  get connected() {
    return this.socket?.connected || false;
  }

  get socketId() {
    return this.socket?.id || null;
  }
}

// Exportar instancia singleton
const socketService = new SocketService();
export default socketService;