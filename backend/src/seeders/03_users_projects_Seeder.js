const User = require('../models/User');
const Project = require('../models/Project');

module.exports = async function seedUsersProjects() {
    try {
        const users = await User.find({});
        const projects = await Project.find({});

        if (users.length === 0 || projects.length === 0) {
            console.log('❌ No hay usuarios o proyectos en la base de datos.');
            return;
        }

        for (const project of projects) {
            for (const member of project.members) {
                const userId = member.userId;

                // Agrega el ID del proyecto al arreglo "projects" del usuario si no está ya presente
                await User.findByIdAndUpdate(
                    userId,
                    { $addToSet: { projects: project._id } }
                );
            }
        }
    } catch (error) {
        console.error('❌ Error al asignar proyectos a los usuarios:', error);
    }
};
