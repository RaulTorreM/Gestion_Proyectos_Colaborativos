const { Schema, model } = require('mongoose');

const userStorySchema = new Schema({
	epicId: {
		type: Schema.Types.ObjectId,
		ref: 'Epic',
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
	moscowPriorityId: {
		type: Number,
		required: true
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
	dueDate: {
		type: Date
	},
	teamMembers: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            role: String
        }
    ],
	authorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
	timestamps: true,
});

userStorySchema.virtual('duration').get(function() {
	if (this.startDate && this.endDate) {
		const diffInTime = this.endDate.getTime() - this.startDate.getTime();
		const diffInDays = diffInTime / (1000 * 3600 * 24);
		return `${diffInDays} días`;
	}
	return 'Fechas inválidas';
});

userStorySchema.virtual('remainingTime').get(function () {
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

userStorySchema.set('toJSON', {
	virtuals: true,
});

module.exports = model('UserStory', userStorySchema);
