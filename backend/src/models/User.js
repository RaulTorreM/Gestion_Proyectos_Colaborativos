const { Schema, model } = require('mongoose');

const userSchema = new Schema({
	name: {
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
	avatar: {
		type: String, //URL de la foto de usuario, src\assets\users\avatars\
	},
	lastLogin: {
		type: Date,
	},
	projects: [
        {
            projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
        }
    ],
	settings: {
		type: JSON,
	},
	preferences: {
		type: JSON,
	}
}, {
	timestamps: true,
});

module.exports = model('User', userSchema);

