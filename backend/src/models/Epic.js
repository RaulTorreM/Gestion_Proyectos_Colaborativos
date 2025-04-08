const { Schema, model } = require('mongoose');

const epicSchema = new Schema({
	project: {
		type: Schema.Types.ObjectId,
		ref: 'Project',
		required: true
	},
	title: {
			type: String,
			required: true,
			trim: true
	},
	description: {
			type: String,
			trim: true
	},
	status: {
			type: String,
			enum: ['Pendiente', 'En Progreso', 'Completado'],
			default: 'Pendiente'
	},
	startDate: {
			type: Date
	},
	endDate: {
			type: Date
	},
	createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
	timestamps: true,
});

epicSchema.virtual('duration').get(function() {
		if (this.startDate && this.endDate) {
			const diffInTime = this.endDate.getTime() - this.startDate.getTime();
			const diffInDays = diffInTime / (1000 * 3600 * 24);
			return `${diffInDays} días`;
		}
		return 'Fechas inválidas';
});

epicSchema.set('toJSON', {
		virtuals: true,
});

module.exports = model('Epic', epicSchema);
