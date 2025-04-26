const { Schema, model } = require('mongoose');

const usersSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		trim: true,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	avatar: {
		type: String, //URL de la foto de usuario, src\assets\users\avatars\
		required: false,
		default: 'default_avatar.png'
	},
	projects: [{ type: Schema.Types.ObjectId, ref: 'Projects' }],
	settings: {
		notifications: {
			email: { type: Boolean, default: true },
			push: { type: Boolean, default: true },
		},
		theme: {
			type: String,
			enum: ['light', 'dark'],
			default: 'dark'
		},
	},
	preferences: {
		language: {
			type: String,
			enum: ['es', 'en'],
			default: 'es'
		},
		timezone: { 
			type: String,
			required: true,
			default: 'America/Lima'
		}
	},
	lastLogin: {
		type: Date,
	},
	deletedAt: {
		type: Date,
		default: null
	}
}, {
	timestamps: true,
});

module.exports = model('User', usersSchema);

