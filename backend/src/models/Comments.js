const { Schema, model } = require('mongoose');
const { DateTime } = require('luxon');

const commentsSchema = new Schema({
	userStoryId: {
		type: Schema.Types.ObjectId,
		ref: 'UserStories',
		required: true
	},
	authorUserId: {
		type: Schema.Types.ObjectId,
		ref: 'Users',
		required: true
	},
	text: {
		type: String,
		required: true,
		trim: true
	},
	mentions: [{ type: Schema.Types.ObjectId, ref: 'Users' }]
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

commentsSchema.virtual('commentDatetimeFormatted').get(function () {
	return DateTime.fromJSDate(this.createdAt)
		.setLocale('es') // o dinámicamente si haces un método
		.toFormat("dd 'de' LLLL yyyy, HH:mm"); // Ej: 13 de abril 2025, 15:23
});

commentsSchema.methods.getCommentDatetimeFormatted = function (locale = 'es') {
	return DateTime.fromJSDate(this.createdAt)
		.setLocale(locale)
		.toLocaleString(DateTime.DATETIME_FULL);
};

// Campo virtual "hace x tiempo"
commentsSchema.virtual('timeAgo').get(function () {
	return DateTime.fromJSDate(this.createdAt)
		.setLocale('es')
		.toRelative(); // Ej: "hace 3 minutos", "hace una hora"
});

commentsSchema.methods.getTimeAgo = function (locale = 'es') {
	return DateTime.fromJSDate(this.createdAt)
		.setLocale(locale)
		.toRelative(); // ejemplo: "hace 3 minutos", "3 minutes ago"
};

/* 
	En el controlador donde se solicita un comentario:
		const comment = await Comment.findById(id);
		const user = await User.findById(comment.authorUserId);

		const locale = user.preferences?.language || 'es';
		const timeAgo = comment.getTimeAgo(locale);
*/

module.exports = model('Comments', commentsSchema);
