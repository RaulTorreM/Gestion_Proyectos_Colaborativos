const { Schema, model } = require('mongoose');

const userSchema = new Schema({
	username: {
		type: String,
		trim: true,
		unique: true,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	settings: {
		type: JSON,
	},
	preferences: {
		type: JSON,
	},
}, {
	timestamps: true,
});

module.exports = model('User', userSchema);

