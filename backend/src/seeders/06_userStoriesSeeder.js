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

    // Función para obtener prioridad
    const getPriorityId = level => {
      const p = priorities.find(pr => pr.moscowPriority === level);
      return p ? p._id : priorities[0]._id;
    };

    // Clamp dates entre inicio y fin de épica
    const clamp = (date, min, max) => date < min ? min : date > max ? max : date;

    const definitions = [
      {
        match: 'autenticación',
        stories: [
          { name: 'Configurar JWT en backend', description: 'Implementar generación y validación de tokens JWT para proteger rutas sensibles.', priority: 1, status: 'Pendiente', rawStart: new Date('2025-01-10'), rawEnd: new Date('2025-03-01') },
          { name: 'Integrar login con OAuth2 de Google', description: 'Permitir el inicio de sesión mediante cuentas de Google usando OAuth2.', priority: 2, status: 'En Progreso', rawStart: new Date('2025-02-15'), rawEnd: new Date('2025-03-10') }
        ]
      },
      {
        match: 'rendimiento',
        stories: [
          { name: 'Implementar caché Redis para consultas pesadas', description: 'Reducir la carga de la base de datos almacenando respuestas frecuentes en Redis.', priority: 1, status: 'Pendiente', rawStart: new Date('2025-02-25'), rawEnd: new Date('2025-03-20') },
          { name: 'Refactorizar endpoints lentos', description: 'Analizar y optimizar los endpoints cuya respuesta supera los 500ms.', priority: 2, status: 'En Progreso', rawStart: new Date('2025-03-21'), rawEnd: new Date('2025-04-10') }
        ]
      },
      {
        match: 'integración continua',
        stories: [
          { name: 'Configurar pipeline en GitHub Actions', description: 'Crear workflow para ejecutar tests y desplegar en staging automáticamente.', priority: 1, status: 'Pendiente', rawStart: new Date('2025-01-25'), rawEnd: new Date('2025-03-15') },
          { name: 'Integrar cobertura de tests', description: 'Agregar reporte de cobertura y fallos en el pipeline de CI.', priority: 2, status: 'En Progreso', rawStart: new Date('2025-02-20'), rawEnd: new Date('2025-04-01') }
        ]
      },
      {
        match: 'Despliegue en producción',
        stories: [
          { name: 'Crear Dockerfile multi-stage', description: 'Optimizar la imagen Docker usando multi-stage build para reducir tamaño.', priority: 1, status: 'Pendiente', rawStart: new Date('2025-03-05'), rawEnd: new Date('2025-04-30') },
          { name: 'Configurar despliegue automático en AWS', description: 'Crear script de despliegue continuo en AWS ECS o EC2.', priority: 2, status: 'Pendiente', rawStart: new Date('2025-04-01'), rawEnd: new Date('2025-05-10') }
        ]
      },
      {
        match: 'gestión de usuarios',
        stories: [
          { name: 'Diseñar formulario de registro', description: 'Crear componente UI para registro de nuevos usuarios.', priority: 1, status: 'Pendiente', rawStart: new Date('2025-01-20'), rawEnd: new Date('2025-02-28') },
          { name: 'Implementar validación de datos', description: 'Agregar validaciones en backend y frontend para datos obligatorios.', priority: 2, status: 'En Progreso', rawStart: new Date('2025-02-15'), rawEnd: new Date('2025-03-25') }
        ]
      }
    ];

    const userStories = [];

    definitions.forEach((def, idx) => {
      const epic = epics.find(e => e.name.includes(def.match));
      if (!epic) return;
      def.stories.forEach((s, i) => {
        // Ajustar fechas
        const start = clamp(s.rawStart, epic.startDate, epic.endDate);
        const end = clamp(s.rawEnd, epic.startDate, epic.endDate);
        const due = end;
        const assigned = users[(idx + i) % users.length];

        userStories.push({
          epicId: epic._id,
          name: s.name,
          description: s.description,
          priorityId: getPriorityId(s.priority),
          status: s.status,
          startDate: start,
          endDate: end,
          dueDate: due,
          assignedTo: [assigned._id],
          authorUserId: assigned._id
        });
      });
    });

    const inserted = await UserStory.insertMany(userStories);
    for (const story of inserted) {
      await Epic.findByIdAndUpdate(story.epicId, { $push: { userStories: story._id } });
    }

    console.log(`✅ ${inserted.length} User Stories creadas con fechas ajustadas a sus épicas.`);
  } catch (err) {
    console.error('❌ Error al insertar User Stories:', err);
  }
};
