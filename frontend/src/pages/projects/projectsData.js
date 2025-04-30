 // Datos de proyectos y versiones basados en la estructura proporcionada
  
 const projectsData = {
    1: {
      _id: 1,
      name: "Sistema de Gestión",
      description: "Desarrollo de sistema para gestión interna de la empresa",
      manager: "Carlos Pérez",
      members: [
        { userId: "1", name: "Carlos Pérez", role: "Líder" },
        { userId: "2", name: "Ana Gómez", role: "Desarrollador" }
      ],
      versions: [
        {
          id: 1,
          name: "v1.0.0",
          version: "v1.0.0",
          status: "Completado",
          startDate: "2023-05-15",
          endDate: "2023-06-30",
          description: "Versión inicial con módulo de autenticación y usuarios",
          progress: 100,
          completedTasks: 28,
          totalTasks: 28,
          releaseNotes: [
            "Sistema de autenticación implementado",
            "CRUD de usuarios básico",
            "Diseño inicial del dashboard"
          ]
        },
        {
          id: 2,
          name: "v1.1.0",
          version: "v1.1.0",
          status: "Completado",
          startDate: "2023-07-01",
          endDate: "2023-08-15",
          description: "Mejoras en el dashboard y reportes básicos",
          progress: 100,
          completedTasks: 32,
          totalTasks: 32,
          releaseNotes: [
            "Nuevos widgets para dashboard",
            "Sistema de reportes básicos",
            "Optimización de rendimiento"
          ]
        },
        {
          id: 3,
          name: "v1.2.0",
          version: "v1.2.0",
          status: "Completado",
          startDate: "2023-08-20",
          endDate: "2023-09-30",
          description: "Integración con API externa y notificaciones",
          progress: 100,
          completedTasks: 24,
          totalTasks: 24,
          releaseNotes: [
            "Integración con API de pagos",
            "Sistema de notificaciones",
            "Mejoras en la UI/UX"
          ]
        },
        {
          id: 4,
          name: "v1.2.5",
          version: "v1.2.5",
          status: "En progreso",
          startDate: "2023-10-01",
          endDate: "2023-11-30",
          description: "Corrección de bugs y pequeñas mejoras",
          progress: 65,
          completedTasks: 42,
          totalTasks: 65,
          releaseNotes: [
            "Corrección de 15 bugs reportados",
            "Mejoras en el sistema de permisos",
            "Optimización de consultas a la BD"
          ]
        },
        {
          id: 5,
          name: "v2.0.0",
          version: "v2.0.0",
          status: "Planificado",
          description: "Rediseño completo y nuevas funcionalidades",
          progress: 0,
          completedTasks: 0,
          totalTasks: 85,
          releaseNotes: []
        }
      ]
    },
    2: {
      _id: 2,
      name: "Portal Clientes",
      description: "Nuevo portal para clientes con autenticación mejorada",
      manager: "Ana Gómez",
      members: [
        { userId: "2", name: "Ana Gómez", role: "Líder" },
        { userId: "3", name: "David López", role: "Frontend" }
      ],
      versions: [
        {
          id: 1,
          name: "v2.0.0",
          version: "v2.0.0",
          status: "Completado",
          startDate: "2023-07-01",
          endDate: "2023-08-15",
          description: "Versión inicial del portal",
          progress: 100,
          completedTasks: 45,
          totalTasks: 45,
          releaseNotes: [
            "Diseño inicial del portal",
            "Autenticación básica",
            "Perfil de usuario"
          ]
        },
        {
          id: 2,
          name: "v2.1.0",
          version: "v2.1.0",
          status: "En progreso",
          startDate: "2023-08-20",
          endDate: "2023-12-15",
          description: "Autenticación mejorada y nuevas características",
          progress: 32,
          completedTasks: 18,
          totalTasks: 56,
          releaseNotes: [
            "Autenticación de dos factores",
            "Integración con redes sociales",
            "Sistema de tickets de soporte"
          ]
        }
      ]
    },
    3: {
      _id: 3,
      name: "App Móvil",
      description: "Aplicación móvil para iOS y Android",
      manager: "David López",
      members: [
        { userId: "3", name: "David López", role: "Líder" },
        { userId: "4", name: "María Rodríguez", role: "Mobile" }
      ],
      versions: [
        {
          id: 1,
          name: "v0.5.0",
          version: "v0.5.0",
          status: "Completado",
          startDate: "2023-09-10",
          endDate: "2023-10-05",
          description: "Prototipo inicial",
          progress: 100,
          completedTasks: 15,
          totalTasks: 15,
          releaseNotes: [
            "Diseño de pantallas principales",
            "Navegación básica",
            "Configuración inicial del proyecto"
          ]
        },
        {
          id: 2,
          name: "v0.9.1",
          version: "v0.9.1",
          status: "En progreso",
          startDate: "2023-10-10",
          endDate: "2024-02-28",
          description: "Versión beta con funcionalidades clave",
          progress: 15,
          completedTasks: 5,
          totalTasks: 33,
          releaseNotes: [
            "Integración con API principal",
            "Autenticación implementada",
            "Primeras pruebas con usuarios"
          ]
        }
      ]
    },
    4: {
      _id: 4,
      name: "Migración BD",
      description: "Migración a nueva base de datos en la nube",
      manager: "María Rodríguez",
      members: [
        { userId: "4", name: "María Rodríguez", role: "Líder" },
        { userId: "1", name: "Carlos Pérez", role: "DBA" }
      ],
      versions: [
        {
          id: 1,
          name: "v1.0.0",
          version: "v1.0.0",
          status: "Completado",
          startDate: "2023-04-01",
          endDate: "2023-05-15",
          description: "Planificación y diseño",
          progress: 100,
          completedTasks: 25,
          totalTasks: 25,
          releaseNotes: [
            "Análisis de requerimientos",
            "Diseño del esquema de migración",
            "Plan de contingencia"
          ]
        },
        {
          id: 2,
          name: "v2.0.0",
          version: "v2.0.0",
          status: "Completado",
          startDate: "2023-05-16",
          endDate: "2023-07-30",
          description: "Migración de datos principales",
          progress: 100,
          completedTasks: 45,
          totalTasks: 45,
          releaseNotes: [
            "Migración de tablas principales",
            "Pruebas de rendimiento",
            "Optimización de índices"
          ]
        },
        {
          id: 3,
          name: "v3.0.0",
          version: "v3.0.0",
          status: "Completado",
          startDate: "2023-08-01",
          endDate: "2023-08-30",
          description: "Migración final y optimizaciones",
          progress: 100,
          completedTasks: 8,
          totalTasks: 8,
          releaseNotes: [
            "Migración de datos históricos",
            "Configuración de replicación",
            "Documentación final"
          ]
        }
      ]
    }
  };

  export default projectsData;