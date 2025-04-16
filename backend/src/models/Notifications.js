const { Schema, model } = require('mongoose');
const { DateTime } = require('luxon');

const notificationsSchema = new Schema({
	type: {
		type: String,
		required: true,
		enum: [
		  'mention',         // Mención en comentario
		  'assignment',      // Asignación de historia
		  'status_change',   // Cambio de estado
		  'deadline',        // Recordatorio de fecha límite
		  'comment',         // Nuevo comentario
		  'version_update',  // Actualización de versión
		  'system_alert'     // Alerta del sistema
		]
	  },

	/*
	USO DEL TYPE: 
	Valor			Descripción								Ejemplo de uso
	mention			Mención del usuario en un comentario	"@Ana te mencionó en un comentario"
	assignment		Asignación de una historia/tarea		"Te asignaron la historia 'Integrar IA'"
	status_change	Cambio de estado en una entidad			La épica 'Diseño UI' pasó a 'En progreso'"
	deadline		Recordatorio de fecha límite			"Quedan 2 días para completar 'Pruebas de IA'"
	comment	Nuevo 	comentario en una entidad				"Carlos comentó en tu historia"
	version_update	Actualización relacionada con una versión	"La versión 2.0 se lanzó exitosamente"
	system_alert	Alertas técnicas del sistema			"Error de conexión con el servicio de IA"
	*/
	title: {
		type: String,
	},
	message: {
		type: String,
		required: true,
	},
	userId: { 
		type: Schema.Types.ObjectId, 
		ref: 'Users' 
	},
	entityType: {
		type: String,
		required: true,
		enum: ["Comments", "UserStories", "Epics", "Projects", "Versions"]
	}, // DE DONDE VINO LA NOTIFICACION - USO PARA RELACION JUNTO AL "entityId"
	
	entityId: {
		type: Schema.Types.ObjectId,
		required: true,
		refPath: 'entityType'
	},

	read: {
		type: Boolean,
		default: false,
	}
}, {
	timestamps: true,
    toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Campo virtual "hace x tiempo"
notificationsSchema.virtual('timeAgo').get(function () {
  return DateTime.fromJSDate(this.createdAt)
    .setLocale('es')
    .toRelative(); // Ej: "hace 3 minutos", "hace una hora"
});

module.exports = model('Notifications', notificationsSchema);
