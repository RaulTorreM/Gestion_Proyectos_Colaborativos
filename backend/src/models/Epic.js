const { Schema, model } = require('mongoose');

const epicsSchema = new Schema({
	projectId: {
		type: Schema.Types.ObjectId,
		ref: 'Projects',
		required: true
	},
	name: {
		type: String,
		required: true,
		trim: true
	},
	description: {
		type: String,
		trim: true
	},
	startDate: {
		type: Date,
		required: true,
	},
	endDate: {
		type: Date
	},
	dueDate: {
		type: Date,
		required: true,
	},
	status: {
		type: String,
		enum: ['Pendiente', 'En Progreso', 'Completado'],
		default: 'Pendiente'
	},
	authorUserId: { type: Schema.Types.ObjectId, ref: 'Users' },
	userStories: [{ type: Schema.Types.ObjectId, ref: 'UserStories' }], 
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

//crear funcion aparte
epicsSchema.virtual('duration').get(function() {
		if (this.startDate && this.endDate) {
			const diffInTime = this.endDate.getTime() - this.startDate.getTime();
			const diffInDays = diffInTime / (1000 * 3600 * 24);
			return `${diffInDays} días`;
		}
		return 'Fechas inválidas';
});

epicsSchema.virtual('statusEntrega').get(function () {
	if (!this.dueDate) return 'Sin fecha límite';
	if (!this.endDate) return 'Sin finalizar';

	const due = new Date(this.dueDate).setHours(0, 0, 0, 0);
	const end = new Date(this.endDate).setHours(0, 0, 0, 0);

	if (end < due) return 'Anticipada';
	if (end === due) return 'Puntual';
	if (end > due) return 'Tardía';
	return 'Sin datos';
});

epicsSchema.virtual('remainingTime').get(function () {
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

module.exports = model('Epic', epicsSchema);
