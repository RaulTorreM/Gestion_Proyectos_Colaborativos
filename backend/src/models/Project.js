const { Schema, model } = require('mongoose');

const projectsSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date, 
    },
    dueDate: {
        type: Date, 

    },
    status: {
        type: String,
        enum: ['No iniciado', 'En Progreso', 'Finalizado'],
        default: 'No iniciado',
        required: true,
    },
    members: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'Users' },
            role: String,
            joinedAt: Date
        }
    ],
    projectType: String,
    epics: [{ type: Schema.Types.ObjectId, ref: 'Epics' }],
    authorUserId: { type: Schema.Types.ObjectId, ref: 'Users' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Calcula la duración del proyecto en días como un campo virtual
projectsSchema.virtual('duration').get(function() {
    // Si las fechas de inicio y fin están correctamente definidas
    if (this.startDate && this.endDate) {
      // Calcula la diferencia en milisegundos
      const diffInTime = this.endDate.getTime() - this.startDate.getTime();
      // Convierte la diferencia de tiempo a días (milisegundos / 86400000)
      const diffInDays = diffInTime / (1000 * 3600 * 24);
      return `${diffInDays} días`;
    }
    return 'Proyecto en Progreso';
});

projectsSchema.virtual('statusEntrega').get(function () {
	if (!this.dueDate) return 'Sin fecha límite';
	if (!this.endDate) return 'Sin finalizar';

	const due = new Date(this.dueDate).setHours(0, 0, 0, 0);
	const end = new Date(this.endDate).setHours(0, 0, 0, 0);

	if (end < due) return 'Anticipada';
	if (end === due) return 'Puntual';
	if (end > due) return 'Tardía';
	return 'Sin datos';
});

projectsSchema.virtual('remainingTime').get(function () {
	if (this.endDate instanceof Date && !isNaN(this.endDate)) {
		const now = new Date();
		// Verifica si la fecha ya expiró
		if (this.endDate < now) {
			return 'Tiempo expirado';
		}
		// Diferencia en milisegundos
		const diffInTime = this.endDate.getTime() - now.getTime();
		// Cálculo de días restantes, redondeando hacia arriba
		const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));
		return `${diffInDays} día${diffInDays === 1 ? '' : 's'}`;
	}
	return 'Fechas inválidas';
});

module.exports = model('Project', projectsSchema);
