require('dotenv').config();
const app = require('./app');
require('./database');

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*', // ajusta según tu frontend
    methods: ['GET', 'POST']
  }
});

// Manejamos conexiones de sockets
io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');

  socket.on('join', (userId) => {
    socket.join(userId); // se une a su sala personal
  });

	socket.on('sendMessage', ({ from, to, content }) => {
	const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	io.to(to).emit('receiveMessage', {
		from,
		content,
		timestamp,
	});
	});

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

// Escuchar servidor
async function main() {
  await server.listen(app.get('port'));
  console.log('Server on port', app.get('port'));
}

main();