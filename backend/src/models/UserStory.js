const { Schema, model } = require('mongoose');

const userStorySchema = new Schema({
	epic: {
		type: Schema.Types.ObjectId,
		ref: 'Epic',
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
	assignedTo: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
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

userStorySchema.set('toJSON', {
	virtuals: true,
});

module.exports = model('UserStory', userStorySchema);
