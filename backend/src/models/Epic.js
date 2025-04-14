const { Schema, model } = require('mongoose');

const epicSchema = new Schema({
	projectId: {
		type: Schema.Types.ObjectId,
		ref: 'Project',
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
	authorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
	stories: [{ type: Schema.Types.ObjectId, ref: 'UserStory' }], 
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

epicSchema.virtual('duration').get(function() {
		if (this.startDate && this.endDate) {
			const diffInTime = this.endDate.getTime() - this.startDate.getTime();
			const diffInDays = diffInTime / (1000 * 3600 * 24);
			return `${diffInDays} días`;
		}
		return 'Fechas inválidas';
});

epicSchema.virtual('statusEntrega').get(function () {
	if (!this.dueDate) return 'Sin fecha límite';
	if (!this.endDate) return 'Sin finalizar';

	const due = new Date(this.dueDate).setHours(0, 0, 0, 0);
	const end = new Date(this.endDate).setHours(0, 0, 0, 0);

	if (end < due) return 'Anticipada';
	if (end === due) return 'Puntual';
	if (end > due) return 'Tardía';
	return 'Sin datos';
});

module.exports = model('Epic', epicSchema);
