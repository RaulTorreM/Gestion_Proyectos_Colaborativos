const { Schema, model } = require('mongoose');
const { DateTime } = require('luxon');

const versionsSchema = new Schema({
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
        default: new Date(),
	},
	status: {
		type: String,
		enum: ['Planeado', 'En Progreso', 'Lanzado'],
		required: false,
		default: 'Planeado',
	},
	releaseDate: {
		type: Date,
		required: true,
	},
	projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
	userStories: [{ type: Schema.Types.ObjectId, ref: 'UserStory' }],
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

// Porcentaje para progreso (requiere populate de userStories)
versionsSchema.virtual('progress').get(function() {
	if (!this.userStories || this.userStories.length === 0) return 0;
	const completed = this.userStories.filter(story => 
	  story.status === 'Completado'
	).length;
	// return Math.round((completed / this.userStories.length) * 100);
	return 100;
});

// Tiempo transcurrido desde creación
versionsSchema.virtual('timeSinceCreation').get(function() {
	return DateTime.fromJSDate(this.createdAt)
	  .setLocale('es')
	  .toRelative({ style: 'short' }); // "hace 2 min", "hace 3 sem"
});

// Tiempo hasta lanzamiento
versionsSchema.virtual('timeToRelease').get(function() {
	if (this.status === 'Lanzado') return 'Lanzada';
	return DateTime.fromJSDate(this.releaseDate)
	  .setLocale('es')
	  .toRelative({ base: DateTime.now(), style: 'short' });
});


module.exports = model('Version', versionsSchema);
