import api from '../axiosInstance';

const ChatService = {
    getUsers: async () => {
    try {
        const users = await api.get('/chat/users'); // users es array directamente
        console.log('Usuarios recibidos:', users);
        return users; // retorna array directamente
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
    }
    },

  // Obtener mensajes con un usuario específico
  getMessages: async (userId) => {
    try {
      const response = await api.get(`/chat/messages/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      throw error;
    }
  },

  // Enviar un nuevo mensaje
  sendMessage: async (toUserId, content) => {
    try {
      const response = await api.post('/chat/messages', { to: toUserId, content });
      return response.data;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }
};

export default ChatService;
