const User = require('../models/User');
const Project = require('../models/Project');

module.exports = async function seedProjects() {
    try {
        // Primero, obtenemos algunos usuarios de la base de datos
        const users = await User.find({});  // Si tienes más usuarios en la base de datos, puedes buscar los existentes

        // Verifica si hay suficientes usuarios para asignar a los proyectos
        if (users.length < 2) {
            console.log('❌ No hay suficientes usuarios en la base de datos para asignar a proyectos.');
            return;
        }

		// Inicialmente el campo "epics" de cada proycto está vacío pero se llenará en 03_epicsSeeder.js
        const projects = [
            {
                name: 'Proyecto de Migración de Base de Datos',
                description: 'Migración completa de la base de datos de la empresa a un nuevo sistema.',
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-06-30'),
                status: 'En Progreso',
                teamMembers: [
                    { userId: users[0]._id, role: 'Líder de Proyecto' },
                    { userId: users[1]._id, role: 'Desarrollador' }
                ],
                projectType: 'Tecnología',
                authorUserId: users[0]._id,  // El creador del proyecto es el primer usuario
            },
            {
                name: 'Desarrollo de Aplicación Móvil',
                description: 'Desarrollo de una nueva aplicación móvil para la gestión de tareas.',
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-12-31'),
                status: 'No iniciado',
                teamMembers: [
                    { userId: users[1]._id, role: 'Desarrollador de iOS' },
                    { userId: users[0]._id, role: 'Desarrollador de Android' }
                ],
                projectType: 'Desarrollo de software',
                authorUserId: users[1]._id,  // El creador del proyecto es el segundo usuario
            }
        ];

        // Inserta los proyectos en la base de datos
        await Project.insertMany(projects);
    } catch (error) {
        console.error('❌ Error al insertar los proyectos:', error);
    }
};
