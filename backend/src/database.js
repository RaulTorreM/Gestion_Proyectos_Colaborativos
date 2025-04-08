const mongoose = require('mongoose');

// console.log("Environment variables:\n", process.env);
console.log("\nMONGODB_URI:", process.env.MONGODB_URI || 'mongodb://localhost:27017/gestionproyectoscolaborativos');

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestionproyectoscolaborativos';

if (!URI) {
	console.error('MONGODB_URI is not defined in environment variables');
	process.exit(1);
}

mongoose.connect(URI);

const connection = mongoose.connection;

connection.once('open', () => {
	console.log('DB is connected');
});

connection.on('error', (err) => {
	console.error('MongoDB connection error:', err);
});
