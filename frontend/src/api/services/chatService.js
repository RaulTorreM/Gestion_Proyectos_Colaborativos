import api from "../axiosInstance";

const ChatService = {
  getUsers: async () => {
    try {
      const response = await api.get("/chat/users");
      const users = Array.isArray(response) ? response : [];
      console.log("Usuarios cargados:", users);
      return users;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  },

  getMessages: async (userId) => {
    try {
      const response = await api.get(`/chat/messages/${userId}`);
      const messages = Array.isArray(response) ? response : [];
      console.log("Mensajes cargados para", userId, ":", messages);
      return messages;
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
      return [];
    }
  },

  sendMessage: async (toUserId, content) => {
    try {
      const response = await api.post("/chat/messages", {
        to: toUserId,
        content,
      });

      // Asegúrate de acceder a response.data si usas axios
      const responseData = response.data || response;

      const formattedMessage = {
        id: responseData.id, // Ahora accedemos correctamente
        from: "Yo",
        content: responseData.content,
        timestamp:
          responseData.timestamp ||
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        isFromCurrentUser: true,
        to: toUserId,
      };

      console.log("Mensaje enviado:", formattedMessage);
      return formattedMessage;
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      throw error;
    }
  },
};

export default ChatService;
