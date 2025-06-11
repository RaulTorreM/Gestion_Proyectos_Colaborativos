require('dotenv').config();
const app = require('./app');
require('./database');
const jwt = require('jsonwebtoken');

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');

// Configuración mejorada de Socket.IO con CORS más permisivo
const io = new Server(server, {
  cors: {
    origin: "*", // Temporalmente más permisivo para debug
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Mapa para mantener track de usuarios conectados
const connectedUsers = new Map();

// Guardar la instancia de io en el app para acceder desde las rutas
app.set('socketio', io);

console.log('🚀 Servidor Socket.IO iniciando...');

// Middleware de autenticación para sockets (MEJORADO)
io.use((socket, next) => {
  try {
    console.log('🔍 Intentando autenticar socket:', socket.id);
    console.log('🔍 Auth data recibida:', socket.handshake.auth);
    
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('❌ Socket sin token:', socket.id);
      console.log('🔍 Headers disponibles:', socket.handshake.headers);
      return next(new Error('No token provided'));
    }

    console.log('🔑 Token recibido (primeros 20 chars):', token.substring(0, 20) + '...');

    // Verificar el token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('❌ Error verificando token:', err.message);
        console.log('❌ Token completo:', token);
        return next(new Error('Invalid token: ' + err.message));
      }
      
      // Guardar información del usuario en el socket
      socket.userId = decoded.id;
      socket.userInfo = decoded;
      console.log('✅ Socket autenticado exitosamente:', {
        socketId: socket.id,
        userId: decoded.id,
        userName: decoded.name || 'N/A',
        tokenExp: new Date(decoded.exp * 1000).toISOString()
      });
      next();
    });
    
  } catch (error) {
    console.error('❌ Error en middleware de autenticación:', error);
    next(new Error('Authentication error: ' + error.message));
  }
});

// Manejamos conexiones de sockets
io.on('connection', (socket) => {
  console.log('🔗 ¡NUEVA CONEXIÓN EXITOSA!', {
    socketId: socket.id,
    userId: socket.userId,
    userName: socket.userInfo?.name || 'N/A',
    transport: socket.conn.transport.name,
    timestamp: new Date().toISOString()
  });
  
  console.log('👥 Total usuarios conectados después de conexión:', io.engine.clientsCount);

  // Verificar si el socket tiene userId
  if (!socket.userId) {
    console.error('❌ Socket conectado sin userId válido');
    socket.emit('authError', { message: 'Usuario no autenticado correctamente' });
    return socket.disconnect();
  }

  // AUTO-JOIN: Unir automáticamente al usuario a su room personal
  try {
    // Verificar si el usuario ya estaba conectado con otro socket
    if (connectedUsers.has(socket.userId)) {
      const oldSocketId = connectedUsers.get(socket.userId);
      console.log('⚠️ Usuario ya conectado, reemplazando socket:', {
        userId: socket.userId,
        oldSocketId,
        newSocketId: socket.id
      });
      
      // Desconectar el socket anterior
      const oldSocket = io.sockets.sockets.get(oldSocketId);
      if (oldSocket) {
        oldSocket.emit('forceDisconnect', {
          reason: 'Nueva conexión desde otro dispositivo',
          timestamp: new Date().toISOString()
        });
        oldSocket.disconnect(true);
      }
    }
    
    // Agregar/actualizar usuario en la lista de conectados
    connectedUsers.set(socket.userId, socket.id);
    
    // Se une a su sala personal
    socket.join(socket.userId.toString());
    
    console.log('✅ Usuario auto-unido exitosamente:', {
      userId: socket.userId,
      socketId: socket.id,
      roomsJoined: Array.from(socket.rooms),
      totalConnectedUsers: connectedUsers.size
    });
    console.log('👥 Usuarios conectados actualmente:', Array.from(connectedUsers.keys()));
    
    // Confirmar que se unió correctamente
    socket.emit('joinConfirmed', { 
      userId: socket.userId, 
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      message: 'Conectado exitosamente al chat',
      connectedUsers: connectedUsers.size
    });
    
  } catch (error) {
    console.error('❌ Error en auto-join:', error);
    socket.emit('joinError', { 
      error: 'Error al unirse al chat',
      details: error.message 
    });
  }

  // Verificar estado de usuario en línea
  socket.on('checkUserOnline', (userId, callback) => {
    const isOnline = connectedUsers.has(userId);
    console.log(`🔍 Verificando si usuario ${userId} está en línea: ${isOnline}`);
    if (typeof callback === 'function') {
      callback({ isOnline, userId });
    }
  });

  // === EVENTO JOIN (Mantener por compatibilidad) ===
  socket.on('join', (userId) => {
    console.log('🏠 Usuario solicitando join explícito:', {
      userId,
      socketUserId: socket.userId,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
    
    // Verificar que el userId coincida con el del token
    if (userId !== socket.userId) {
      console.warn('⚠️ Usuario intentando unirse con ID diferente al token');
      return socket.emit('joinError', {
        error: 'ID de usuario no coincide con el token',
        details: 'Token verification failed'
      });
    }
    
    // Si ya está en su room, solo confirmar
    if (socket.rooms.has(userId.toString())) {
      socket.emit('joinConfirmed', { 
        userId, 
        socketId: socket.id,
        timestamp: new Date().toISOString(),
        message: 'Ya estabas conectado al chat'
      });
    }
  });

  // === EVENTO SEND MESSAGE (Opcional, si quieres manejar vía socket) ===
  socket.on('sendMessage', async ({ to, content }) => {
    try {
      console.log('📨 Mensaje vía socket desde:', socket.userId, 'hacia:', to);
      
      // Verificar contenido
      if (!to || !content || !content.trim()) {
        return socket.emit('messageError', {
          error: 'Datos inválidos',
          details: 'El destinatario y contenido son requeridos'
        });
      }

      // Verificar si el destinatario existe
      const User = require('./models/User');
      const recipientExists = await User.exists({ _id: to });
      
      if (!recipientExists) {
        return socket.emit('messageError', {
          error: 'Destinatario no encontrado',
          details: 'El usuario destinatario no existe'
        });
      }

      // Verificar que no se envíe mensaje a sí mismo
      if (socket.userId === to) {
        return socket.emit('messageError', {
          error: 'Error de envío',
          details: 'No puedes enviarte mensajes a ti mismo'
        });
      }

      // Crear y guardar el mensaje
      const Message = require('./models/Message');
      const newMessage = new Message({
        from: socket.userId,
        to,
        content: content.trim()
      });
      
      await newMessage.save();
      
      const savedMessage = await Message.findById(newMessage._id)
        .populate('from', 'name avatar')
        .populate('to', 'name avatar');

      console.log('💾 Mensaje guardado vía socket:', {
        id: savedMessage._id.toString(),
        from: savedMessage.from.name,
        to: savedMessage.to.name,
        content: savedMessage.content
      });

      // Formatear mensaje para el receptor
      const messageForReceiver = {
        id: savedMessage._id.toString(),
        from: savedMessage.from._id.toString(),
        senderName: savedMessage.from.name,
        to: savedMessage.to._id.toString(),
        content: savedMessage.content,
        timestamp: savedMessage.createdAt.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isFromCurrentUser: false,
        createdAt: savedMessage.createdAt
      };

      // Enviar al destinatario si está conectado
      const isRecipientOnline = connectedUsers.has(to);
      console.log(`📤 Enviando mensaje a room: ${to} (¿está en línea? ${isRecipientOnline})`);
      
      if (isRecipientOnline) {
        io.to(to).emit('receiveMessage', messageForReceiver);
        console.log('✅ Mensaje enviado al destinatario en línea');
      } else {
        console.log('⚠️ Destinatario no está en línea, mensaje guardado para cuando se conecte');
      }

      // Confirmación al remitente
      const senderMessageData = {
        id: savedMessage._id.toString(),
        from: 'Yo',
        content: savedMessage.content,
        timestamp: savedMessage.createdAt.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isFromCurrentUser: true,
        to: savedMessage.to._id.toString(),
        createdAt: savedMessage.createdAt
      };
      
      socket.emit('newMessage', senderMessageData);

    } catch (error) {
      console.error('❌ Error procesando mensaje vía socket:', error);
      socket.emit('messageError', {
        error: 'Error al procesar mensaje',
        details: error.message
      });
    }
  });

  // === EVENTO DISCONNECT ===
  socket.on('disconnect', (reason) => {
    console.log('🔌 Usuario desconectado:', {
      socketId: socket.id,
      userId: socket.userId,
      userName: socket.userInfo?.name || 'N/A',
      reason,
      timestamp: new Date().toISOString()
    });
    
    // Remover usuario de la lista de conectados
    if (socket.userId) {
      const wasConnected = connectedUsers.has(socket.userId);
      connectedUsers.delete(socket.userId);
      console.log(`🗑️ Usuario removido: ${socket.userId} (estaba conectado: ${wasConnected})`);
      console.log('👥 Usuarios conectados restantes:', Array.from(connectedUsers.keys()));
    }
    
    console.log('📊 Total usuarios conectados después de desconexión:', io.engine.clientsCount);
  });

  // === EVENTOS DE DIAGNÓSTICO ===
  socket.on('ping', (callback) => {
    const pongData = { 
      timestamp: new Date().toISOString(),
      serverTime: Date.now(),
      userId: socket.userId,
      connectedUsers: connectedUsers.size
    };
    if (typeof callback === 'function') {
      callback(pongData);
    } else {
      socket.emit('pong', pongData);
    }
  });
  
  socket.on('getConnectedUsers', (callback) => {
    const usersList = Array.from(connectedUsers.keys());
    const result = {
      users: usersList,
      count: usersList.length,
      timestamp: new Date().toISOString()
    };
    
    if (typeof callback === 'function') {
      callback(result);
    } else {
      socket.emit('connectedUsers', result);
    }
  });
  
  socket.on('getRooms', (callback) => {
    const rooms = Array.from(socket.rooms);
    const result = {
      rooms,
      userId: socket.userId,
      socketId: socket.id
    };
    
    if (typeof callback === 'function') {
      callback(result);
    } else {
      socket.emit('roomsInfo', result);
    }
  });
  
  // === EVENTO PARA ACTUALIZAR ESTADO ===
  socket.on('updateUserStatus', (status) => {
    if (socket.userId) {
      console.log(`🔄 Usuario ${socket.userId} actualizando estado a: ${status}`);
      socket.emit('statusUpdated', { 
        userId: socket.userId,
        status,
        timestamp: new Date().toISOString()
      });
    }
  });

  // === EVENTOS DE ERROR ===
  socket.on('error', (error) => {
    console.error('❌ Error en socket:', {
      socketId: socket.id,
      userId: socket.userId,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  });

  // Emitir evento inicial de conexión exitosa
  socket.emit('connected', {
    message: 'Conectado al servidor Socket.IO',
    userId: socket.userId,
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });
});

// === MANEJO DE ERRORES DEL SERVIDOR ===
io.engine.on('connection_error', (err) => {
  console.error('❌ Error de conexión del motor:', {
    code: err.code,
    message: err.message,
    context: err.context,
    type: err.type
  });
});

// Función para depuración: mostrar estadísticas cada 30 segundos
setInterval(() => {
  const realConnections = io.engine.clientsCount;
  const trackedUsers = connectedUsers.size;
  
  console.log('📊 Estadísticas del servidor:', {
    totalConnections: realConnections,
    connectedUsers: trackedUsers,
    usersList: Array.from(connectedUsers.keys()),
    timestamp: new Date().toISOString(),
    discrepancy: realConnections !== trackedUsers ? '⚠️ DISCREPANCIA DETECTADA' : '✅ OK'
  });
  
  // Si hay discrepancia, mostrar detalles adicionales
  if (realConnections !== trackedUsers) {
    console.log('🔍 Sockets conectados en io.sockets:');
    io.sockets.sockets.forEach((socket, id) => {
      console.log(`  - Socket ${id}: userId=${socket.userId}, connected=${socket.connected}`);
    });
  }
}, 30000);

// === FUNCIÓN PRINCIPAL ===
async function main() {
  try {
    const port = app.get('port') || 4000;
    await server.listen(port);
    
    console.log('🎉 ¡Servidor iniciado exitosamente!');
    console.log('🌐 Puerto:', port);
    console.log('🔗 Socket.IO habilitado con autenticación JWT');
    console.log('🚀 CORS configurado temporalmente como permisivo para debug');
    console.log('⏰ Tiempo de inicio:', new Date().toISOString());
    console.log('🔐 JWT_SECRET configurado:', process.env.JWT_SECRET ? 'SÍ' : 'NO');
    
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// === MANEJO GRACEFUL DE CIERRE ===
process.on('SIGTERM', () => {
  console.log('📴 Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 Recibida señal SIGINT, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

main();