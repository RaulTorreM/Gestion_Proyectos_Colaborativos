const { Schema, model } = require('mongoose');

const versionSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true,
	},
	description: {
		type: String,
		trim: true
	},
	status: {
		type: String,
		enum: ['Planeado', 'En Progreso', 'Lanzado'],
		default: 'Planeado'
	},
	startDate: {
		type: Date
	},
	releaseDate: {
		type: Date
	},
	projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
	userStories: [{ type: Schema.Types.ObjectId, ref: 'UserStory' }],
	authorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
	timestamps: true,
   /*  toJSON: { virtuals: true },
	toObject: { virtuals: true } */
});

module.exports = model('Version', versionSchema);
