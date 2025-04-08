const User = require('../models/User');
const Project = require('../models/Project');
const Epic = require('../models/Epic');

module.exports = async function seedEpics() {
    try {
        // Primero, obtenemos algunos usuarios de la base de datos
        const users = await User.find({});  // Si tienes más usuarios en la base de datos, puedes buscar los existentes

        // Verifica si hay suficientes usuarios para asignar a las épicas
        if (users.length < 2) {
            console.log('❌ No hay suficientes usuarios en la base de datos para asignar a épicas.');
            return;
        }

        // Obtener algunos proyectos para asignar las épicas
        const projects = await Project.find({});

        if (projects.length < 2) {
            console.log('❌ No hay suficientes proyectos en la base de datos.');
            return;
        }

        // Crear épicas de ejemplo
        const epics = [
            {
                project: projects[0]._id, // Relacionar con el primer proyecto
                title: 'Migración de la base de datos',
                description: 'Migrar la base de datos de MySQL a MongoDB.',
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-03-01'),
                status: 'En Progreso',
                createdBy: users[0]._id,  // Usuario 1 como creador de la épica
            },
            {
                project: projects[1]._id, // Relacionar con el primer proyecto
                title: 'Desarrollo de la interfaz de usuario',
                description: 'Crear la interfaz de usuario para la aplicación móvil.',
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-05-30'),
                status: 'Pendiente',
                createdBy: users[1]._id,  // Usuario 2 como creador de la épica
            },
            {
                project: projects[0]._id, // Relacionar con el primer proyecto
                title: 'Integración de la API',
                description: 'Integrar la API externa para la sincronización de datos.',
                startDate: new Date('2025-03-01'),
                endDate: new Date('2025-06-01'),
                status: 'Pendiente',
                createdBy: users[0]._id,  // Usuario 1 como creador de la épica
            }
        ];

        // Insertar las épicas en la base de datos
        const insertedEpics = await Epic.insertMany(epics);
        console.log('✅ Épicas insertadas correctamente');

        // Ahora, actualizamos los proyectos para que tengan referencias a las épicas
        await Project.updateMany(
            { _id: { $in: insertedEpics.map(epic => epic.projectId) } }, 
            { $push: { epics: { $each: insertedEpics.map(epic => ({ epicId: epic._id })) } } }
        );

        console.log('✅ Proyectos actualizados con las épicas');

    } catch (error) {
        console.error('❌ Error al insertar las épicas:', error);
    }
};
