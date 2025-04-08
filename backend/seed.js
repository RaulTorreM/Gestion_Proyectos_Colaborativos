const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestionproyectoscolaborativos';

// Función para cargar todos los modelos
async function loadModels() {
    const modelsDir = path.join(__dirname, 'src/models');
    if (fs.existsSync(modelsDir)) {
        const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
        for (const file of modelFiles) {
            require(path.join(modelsDir, file));
        }
    }
}

// Función para limpiar completamente la base de datos
async function clearDatabase() {
    console.log('🔄 Iniciando limpieza de la base de datos...');
    
    // Opción alternativa: limpiar directamente las colecciones en MongoDB
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    // Eliminar directamente la colección counters si existe
    if (collections.some(col => col.name === 'counters')) {
        await db.collection('counters').deleteMany({});
        console.log('🔄 Contador de secuencias reiniciado');
    }
    
    for (const collection of collections) {
        try {
            await db.dropCollection(collection.name);
            console.log(`✅ Colección "${collection.name}" eliminada correctamente`);
        } catch (error) {
            console.error(`❌ Error al eliminar colección "${collection.name}":`, error.message);
        }
    }
    
    console.log('✨ Base de datos limpiada completamente');
}

async function runSeeders() {
    try {
        await mongoose.connect(URI);
        console.log(`🔌 Conectado a la base de datos: ${URI}`);
        
        // Primero carga los modelos para que Mongoose los registre
        await loadModels();
        
        // Luego limpia la base de datos
        await clearDatabase();

        // Lee todos los archivos en la carpeta 'seeders'
        const seedersDir = path.join(__dirname, 'src/seeders');
        const seederFiles = fs.readdirSync(seedersDir)
            .filter(file => file.endsWith('.js'))
            .sort();

        // Ejecuta cada seeder
        for (const file of seederFiles) {
            try {
                console.log(`🌱 Ejecutando seeder: ${file}...`);
                const seederPath = path.join(seedersDir, file);
                const seeder = require(seederPath);
                await seeder();
                console.log(`✅ Seeder ${file} completado`);
            } catch (error) {
                console.error(`❌ Error en seeder ${file}:`, error);
            }
        }
        
        console.log('✅ Todos los seeders han sido ejecutados correctamente');
    } catch (error) {
        console.error('❌ Error durante la ejecución de seeders:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Conexión cerrada con MongoDB');
    }
}

runSeeders();