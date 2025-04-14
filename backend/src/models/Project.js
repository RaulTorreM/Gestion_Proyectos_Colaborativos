const { Schema, model } = require('mongoose');

const projectSchema = new Schema({
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
        required: true,
    },
    status: {
        type: String,
        enum: ['No iniciado', 'En Progreso', 'Finalizado'],
        default: 'No iniciado',
        required: true,
    },
    members: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            role: String,
            joinedAt: Date
        }
    ],
    projectType: String,
    epics: [{ type: Schema.Types.ObjectId, ref: 'Epic' }],
    authorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Calcula la duración del proyecto en días como un campo virtual
projectSchema.virtual('duration').get(function() {
    // Si las fechas de inicio y fin están correctamente definidas
    if (this.startDate && this.endDate) {
      // Calcula la diferencia en milisegundos
      const diffInTime = this.endDate.getTime() - this.startDate.getTime();
      // Convierte la diferencia de tiempo a días (milisegundos / 86400000)
      const diffInDays = diffInTime / (1000 * 3600 * 24);
      return `${diffInDays} días`;
    }
    return 'Fechas inválidas';
});

projectSchema.virtual('statusEntrega').get(function () {
	if (!this.dueDate) return 'Sin fecha límite';
	if (!this.endDate) return 'Sin finalizar';

	const due = new Date(this.dueDate).setHours(0, 0, 0, 0);
	const end = new Date(this.endDate).setHours(0, 0, 0, 0);

	if (end < due) return 'Anticipada';
	if (end === due) return 'Puntual';
	if (end > due) return 'Tardía';
	return 'Sin datos';
});

module.exports = model('Project', projectSchema);
