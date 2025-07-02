const UserStory = require('../models/UserStory');
const Epic = require('../models/Epic');
const User = require('../models/User');
const Priority = require('../models/Priority');

module.exports = async function seedUserStories() {
  try {
    const users = await User.find();
    const epics = await Epic.find();
    const priorities = await Priority.find({ moscowPriority: { $exists: true } });

    if (users.length < 2 || epics.length === 0 || priorities.length < 2) {
      console.error('❌ No hay suficientes datos para crear User Stories. Verifica Usuarios, Épicas y Prioridades.');
      return;
    }

    // Helper para localizar prioridad por valor MoSCoW
    const getPriorityId = (level) => {
      const p = priorities.find(pr => pr.moscowPriority === level);
      return p ? p._id : priorities[0]._id;
    };

    // Crear User Stories específicas para cada épica
    const userStories = [];

    // 1. Autenticación
    const epicAuth = epics.find(e => e.name.includes('autenticación'));
    if (epicAuth) {
      userStories.push(
        {
          epicId: epicAuth._id,
          name: 'Configurar JWT en backend',
          description: 'Implementar generación y validación de tokens JWT para proteger rutas sensibles.',
          priorityId: getPriorityId(1), // Must have
          status: 'Pendiente',
          startDate: new Date('2025-04-01'),
          endDate: new Date('2025-04-07'),
          dueDate: new Date('2025-04-05'),
          assignedTo: [users[0]._id],
          authorUserId: users[0]._id,
        },
        {
          epicId: epicAuth._id,
          name: 'Integrar login con OAuth2 de Google',
          description: 'Permitir el inicio de sesión mediante cuentas de Google usando OAuth2.',
          priorityId: getPriorityId(2), // Should have
          status: 'En Progreso',
          startDate: new Date('2025-04-08'),
          endDate: new Date('2025-04-15'),
          dueDate: new Date('2025-04-12'),
          assignedTo: [users[1]._id],
          authorUserId: users[1]._id,
        }
      );
    }

    // 2. Rendimiento backend
    const epicPerf = epics.find(e => e.name.includes('rendimiento'));
    if (epicPerf) {
      userStories.push(
        {
          epicId: epicPerf._id,
          name: 'Implementar caché Redis para consultas pesadas',
          description: 'Reducir la carga de la base de datos almacenando respuestas frecuentes en Redis.',
          priorityId: getPriorityId(1),
          status: 'Pendiente',
          startDate: new Date('2025-04-01'),
          endDate: new Date('2025-04-10'),
          dueDate: new Date('2025-04-08'),
          assignedTo: [users[1]._id],
          authorUserId: users[1]._id,
        },
        {
          epicId: epicPerf._id,
          name: 'Refactorizar endpoints lentos',
          description: 'Analizar y optimizar los endpoints cuya respuesta supera los 500ms.',
          priorityId: getPriorityId(2),
          status: 'En Progreso',
          startDate: new Date('2025-04-11'),
          endDate: new Date('2025-04-20'),
          dueDate: new Date('2025-04-18'),
          assignedTo: [users[0]._id],
          authorUserId: users[0]._id,
        }
      );
    }

    // 3. CI/CD
    const epicCI = epics.find(e => e.name.includes('integración continua'));
    if (epicCI) {
      userStories.push(
        {
          epicId: epicCI._id,
          name: 'Configurar pipeline en GitHub Actions',
          description: 'Crear workflow para ejecutar tests y desplegar en staging automáticamente.',
          priorityId: getPriorityId(1),
          status: 'Pendiente',
          startDate: new Date('2025-04-01'),
          endDate: new Date('2025-04-10'),
          dueDate: new Date('2025-04-09'),
          assignedTo: [users[0]._id],
          authorUserId: users[0]._id,
        },
        {
          epicId: epicCI._id,
          name: 'Integrar cobertura de tests',
          description: 'Agregar reporte de cobertura y fallos en el pipeline de CI.',
          priorityId: getPriorityId(2),
          status: 'En Progreso',
          startDate: new Date('2025-04-11'),
          endDate: new Date('2025-04-20'),
          dueDate: new Date('2025-04-18'),
          assignedTo: [users[1]._id],
          authorUserId: users[1]._id,
        }
      );
    }

    // 4. Despliegue producción
    const epicDeploy = epics.find(e => e.name.includes('Despliegue en producción'));
    if (epicDeploy) {
      userStories.push(
        {
          epicId: epicDeploy._id,
          name: 'Crear Dockerfile multi-stage',
          description: 'Optimizar la imagen Docker usando multi-stage build para reducir tamaño.',
          priorityId: getPriorityId(1),
          status: 'Pendiente',
          startDate: new Date('2025-04-01'),
          endDate: new Date('2025-04-07'),
          dueDate: new Date('2025-04-06'),
          assignedTo: [users[1]._id],
          authorUserId: users[1]._id,
        },
        {
          epicId: epicDeploy._id,
          name: 'Configurar despliegue automático en AWS',
          description: 'Crear script de despliegue continuo en AWS ECS o EC2.',
          priorityId: getPriorityId(2),
          status: 'Pendiente',
          startDate: new Date('2025-04-08'),
          endDate: new Date('2025-04-15'),
          dueDate: new Date('2025-04-12'),
          assignedTo: [users[0]._id],
          authorUserId: users[0]._id,
        }
      );
    }

    // 5. Gestión de usuarios
    const epicUsers = epics.find(e => e.name.includes('gestión de usuarios'));
    if (epicUsers) {
      userStories.push(
        {
          epicId: epicUsers._id,
          name: 'Diseñar formulario de registro',
          description: 'Crear componente UI para registro de nuevos usuarios.',
          priorityId: getPriorityId(1),
          status: 'Pendiente',
          startDate: new Date('2025-04-01'),
          endDate: new Date('2025-04-05'),
          dueDate: new Date('2025-04-04'),
          assignedTo: [users[0]._id],
          authorUserId: users[0]._id,
        },
        {
          epicId: epicUsers._id,
          name: 'Implementar validación de datos',
          description: 'Agregar validaciones en backend y frontend para datos obligatorios.',
          priorityId: getPriorityId(2),
          status: 'En Progreso',
          startDate: new Date('2025-04-06'),
          endDate: new Date('2025-04-12'),
          dueDate: new Date('2025-04-10'),
          assignedTo: [users[1]._id],
          authorUserId: users[1]._id,
        }
      );
    }

    // Insertar y asociar
    const inserted = await UserStory.insertMany(userStories);
    for (const story of inserted) {
      await Epic.findByIdAndUpdate(story.epicId, { $push: { userStories: story._id } });
    }

    console.log(`✅ ${inserted.length} User Stories creadas con nombres únicos.`);

  } catch (err) {
    console.error('❌ Error al insertar User Stories:', err);
  }
};
