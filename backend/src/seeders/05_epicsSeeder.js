const User = require('../models/User');
const Project = require('../models/Project');
const Epic = require('../models/Epic');
const Priority = require('../models/Priority');

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

        // Obtener algunas prioridades para asignar a las épicas
        const priorities = await Priority.find({});

        if (priorities.length < 3) {
            console.log('❌ No hay suficientes prioridades normales en la base de datos.');
            return;
        }

        // Crear épicas de ejemplo
        const epics = [
            {
                projectId: projects[0]._id, // Relacionar con el primer proyecto
                name: 'Migración de la base de datos',
                description: 'Migrar la base de datos de MySQL a MongoDB.',
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-03-01'),
                dueDate: new Date('2025-04-01'),
                priorityId: priorities[4], // Alta
                status: 'En Progreso',
                authorUserId: users[0]._id,  // Usuario 1 como creador de la épica
            },
            {
                projectId: projects[1]._id, // Relacionar con el primer proyecto
                name: 'Desarrollo de la interfaz de usuario',
                description: 'Crear la interfaz de usuario para la aplicación móvil.',
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-05-30'),
                dueDate: new Date('2025-06-01'),
                priorityId: priorities[5], // Media
                status: 'Pendiente',
                authorUserId: users[1]._id,  // Usuario 2 como creador de la épica
            },
            {
                projectId: projects[0]._id, // Relacionar con el primer proyecto
                name: 'Integración de la API',
                description: 'Integrar la API externa para la sincronización de datos.',
                startDate: new Date('2025-03-01'),
                endDate: new Date('2025-06-01'),
                dueDate: new Date('2025-07-01'),
                priorityId: priorities[6], // Baja
                status: 'Pendiente',
                authorUserId: users[0]._id,  // Usuario 1 como creador de la épica
            }
        ];

        // Insertar las épicas en la base de datos
        const insertedEpics = await Epic.insertMany(epics);

		// Actualizar epics en Projects relacionados
        for (let i = 0; i < insertedEpics.length; i++) {
            const epic = insertedEpics[i];

            await Project.findByIdAndUpdate(
                epic.projectId, // ID del proyecto relacionado
                { $push: { epics: epic._id } } // Asumiendo que el campo es un array llamado `epics`
            );
        }

        console.log('✅ Proyectos actualizados con las épicas');

    } catch (error) {
        console.error('❌ Error al insertar las épicas:', error);
    }
};
