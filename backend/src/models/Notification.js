const { Schema, model } = require('mongoose');
const { DateTime } = require('luxon');

const notificationSchema = new Schema({
	type: {
		type: String,
		trim: true,
		required: true,
		enum: ['info', 'warning', 'success', 'error'],
	},
	description: {
		type: String,
		required: true,
	},
	user: { 
		type: Schema.Types.ObjectId, 
		ref: 'User' 
	}
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Campo virtual "hace x tiempo"
notificationSchema.virtual('timeAgo').get(function () {
  return DateTime.fromJSDate(this.createdAt)
    .setLocale('es')
    .toRelative(); // Ej: "hace 3 minutos", "hace una hora"
});

module.exports = model('Notification', notificationSchema);
