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
		required: false,
		default: new Date()
	},
	endDate: {
		type: Date,
		required: false,
		default: null,
	},
	dueDate: {
		type: Date,
		required: false,
		default: null
	},
	status: {
		type: String,
		enum: ['Activo', 'Archivado'], // actualizado según el nuevo enum
		required: false,
		default: 'Activo', // actualizado para que por defecto sea 'Activo'
	},
	archivedAt: { // campo para fecha de archivado
		type: Date,
		default: null
	},
	archivedBy: { // referencia al usuario que archivó
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: null
	},
	members: [
		{
			userId: { type: Schema.Types.ObjectId, ref: 'User' },
			role: String,
			joinedAt: Date
		}
	],
	projectType: {
		type: String,
		required: true,
	},
	versions: {
		type: [{ type: Schema.Types.ObjectId, ref: 'Version' }],
		required: false,
		default: []
	},
	epics: [{ type: Schema.Types.ObjectId, ref: 'Epic' }],
	authorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
	deletedAt: {
		type: Date,
		required: false,
		default: null
	}
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Virtual: duración del proyecto
projectsSchema.virtual('duration').get(function () {
	if (this.startDate && this.endDate) {
		const diffInTime = this.endDate.getTime() - this.startDate.getTime();
		const diffInDays = diffInTime / (1000 * 3600 * 24);
		return `${diffInDays} días`;
	}
	return 'Proyecto en Progreso';
});

// Virtual: estado de la entrega
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

// Virtual: tiempo restante
projectsSchema.virtual('remainingTime').get(function () {
	if (this.endDate && this.endDate instanceof Date && !isNaN(this.endDate)) {
		const now = new Date();
		if (this.endDate < now) {
			return 'Tiempo expirado';
		}
		const diffInTime = this.endDate.getTime() - now.getTime();
		const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));
		return `${diffInDays} día${diffInDays === 1 ? '' : 's'}`;
	}
	return 'Fechas inválidas';
});

module.exports = model('Project', projectsSchema);
