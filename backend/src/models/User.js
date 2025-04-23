const { Schema, model } = require('mongoose');

const usersSchema = new Schema({
	name: {
		type: String,
		trim: true,
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
	avatar: {
		type: String, //URL de la foto de usuario, src\assets\users\avatars\
	},
	projects: [
        {
            type: Schema.Types.ObjectId, ref: 'Projects',
        }
    ],
	settings: {
		notifications: {
			email: Boolean,
			push: Boolean
		},
		theme: String
	},
	lastLogin: {
		type: Date,
	},
	preferences: {
		language: String,
    	timezone: String
	}
}, {
	timestamps: true,
});

module.exports = model('User', usersSchema);

