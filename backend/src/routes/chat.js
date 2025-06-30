const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/validateToken");
const Message = require("../models/Message");
const User = require("../models/User");

router.get("/users", validateToken, async (req, res) => {
  try {
    const currentUserId = req.userId;

    const connectedUsers = req.app.get("connectedUsers"); // ✅ Acceder al mapa correcto
    const connectedUserIds = Array.from(connectedUsers?.keys() || []);

    const users = await User.find({
      _id: { $ne: currentUserId },
      deletedAt: null,
    }).select("name avatar settings.theme");

    const currentUser = await User.findById(currentUserId).select(
      "name avatar settings.theme"
    );

    const usersWithStatus = users.map((user) => {
      const isOnline = connectedUserIds.includes(user._id.toString());

      return {
        id: user._id.toString(),
        name: user.name,
        avatar: user.avatar,
        status: isOnline ? "online" : "offline",
        theme: user.settings?.theme || "dark",
        isCurrentUser: false,
      };
    });

    // Insertar el usuario actual primero
    usersWithStatus.unshift({
      id: currentUser._id.toString(),
      name: `${currentUser.name} (Tú)`,
      avatar: currentUser.avatar,
      status: "online",
      theme: currentUser.settings?.theme || "dark",
      isCurrentUser: true,
    });

    res.json(usersWithStatus);
  } catch (error) {
    console.error("Error al obtener usuarios del chat:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

router.get("/messages/:userId", validateToken, async (req, res) => {
  try {
    const currentUserId = req.userId;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { from: currentUserId, to: otherUserId },
        { from: otherUserId, to: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("from", "name avatar")
      .populate("to", "name avatar");

    const formattedMessages = messages.map((msg) => {
      const isFromCurrentUser = msg.from._id.toString() === currentUserId;

      return {
        id: msg._id.toString(),
        from: isFromCurrentUser ? "Yo" : msg.from.name,
        content: msg.content,
        timestamp: msg.createdAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isFromCurrentUser,
        createdAt: msg.createdAt,
      };
    });

    res.json(formattedMessages);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
});

router.post("/messages", validateToken, async (req, res) => {
  try {
    const { to, content } = req.body;
    const currentUserId = req.userId;
    const io = req.app.get("socketio");

    // Validaciones básicas
    if (!to || !content || !content.trim()) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    // Verificar que el destinatario existe
    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({ error: "Destinatario no encontrado" });
    }

    // Verificar que no se envíe mensaje a sí mismo
    if (currentUserId === to) {
      return res
        .status(400)
        .json({ error: "No puedes enviarte mensajes a ti mismo" });
    }

    // Crear el mensaje
    const newMessage = new Message({
      from: currentUserId,
      to,
      content: content.trim(),
    });

    await newMessage.save();

    const savedMessage = await Message.findById(newMessage._id)
      .populate("from", "name avatar")
      .populate("to", "name avatar");

    console.log("Mensaje guardado:", {
      id: savedMessage._id.toString(),
      from: savedMessage.from.name,
      to: savedMessage.to.name,
      content: savedMessage.content,
    });

    // OBTENER INFORMACIÓN REAL DE CONEXIONES
    if (io) {
      try {
        // Obtener todos los sockets conectados
        const connectedSockets = await io.fetchSockets();

        console.log("🔍 Información de diagnóstico:");
        console.log("📊 Total sockets conectados:", connectedSockets.length);

        // Mapear usuarios conectados
        const connectedUserIds = [];
        const socketInfo = [];

        connectedSockets.forEach((socket) => {
          if (socket.userId) {
            connectedUserIds.push(socket.userId);
            socketInfo.push({
              socketId: socket.id,
              userId: socket.userId,
              rooms: Array.from(socket.rooms),
            });
          }
        });

        console.log("👥 Usuarios conectados:", [...new Set(connectedUserIds)]);
        console.log("🏠 Información de sockets:", socketInfo);
        console.log("🎯 Buscando destinatario:", to);

        // Verificar si el destinatario está conectado
        const recipientSocket = connectedSockets.find(
          (socket) => socket.userId === to
        );

        if (recipientSocket) {
          console.log("✅ Destinatario ENCONTRADO:", {
            socketId: recipientSocket.id,
            userId: recipientSocket.userId,
            rooms: Array.from(recipientSocket.rooms),
          });
        } else {
          console.log("❌ Destinatario NO encontrado en conexiones activas");
          console.log("🔍 Usuarios disponibles:", connectedUserIds);
        }

        // Formatear mensaje para el receptor
        const messageForReceiver = {
          id: savedMessage._id.toString(),
          from: savedMessage.from._id.toString(), // ID del remitente para organizar conversación
          senderName: savedMessage.from.name, // Nombre del remitente para mostrar
          to: savedMessage.to._id.toString(),
          content: savedMessage.content,
          timestamp: savedMessage.createdAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isFromCurrentUser: false,
          createdAt: savedMessage.createdAt,
        };

        console.log("📤 Enviando mensaje via socket a destinatario:", to);
        console.log("📦 Datos del mensaje:", messageForReceiver);

        // Enviar al destinatario usando múltiples métodos para asegurar entrega

        // Método 1: Enviar al room del usuario
        const roomResult = io.to(to).emit("receiveMessage", messageForReceiver);
        console.log("📤 Enviado a room:", to, "Resultado:", roomResult);

        // Método 2: Enviar directamente al socket si existe
        if (recipientSocket) {
          recipientSocket.emit("receiveMessage", messageForReceiver);
          console.log("📤 Enviado directamente al socket:", recipientSocket.id);
        }

        // Método 3: Broadcast a todos los sockets del usuario (por si tiene múltiples conexiones)
        connectedSockets.forEach((socket) => {
          if (socket.userId === to) {
            socket.emit("receiveMessage", messageForReceiver);
            console.log("📤 Broadcast enviado a socket:", socket.id);
          }
        });

        console.log("✅ Mensaje procesado para envío via socket");
      } catch (socketError) {
        console.error("❌ Error al procesar sockets:", socketError);
      }
    } else {
      console.error("❌ Socket.IO no disponible en la aplicación");
    }

    // Respuesta para el remitente
    const responseForSender = {
      id: savedMessage._id.toString(),
      from: "Yo",
      content: savedMessage.content,
      timestamp: savedMessage.createdAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isFromCurrentUser: true,
      to: savedMessage.to._id.toString(),
      createdAt: savedMessage.createdAt,
    };

    console.log("📨 Enviando respuesta al remitente:", responseForSender);
    res.status(201).json(responseForSender);
  } catch (error) {
    console.error("❌ Error al enviar mensaje:", error);
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
});

module.exports = router;
