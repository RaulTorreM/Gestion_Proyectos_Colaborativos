const { Schema, model } = require('mongoose');

const prioritySchema = new Schema({
	moscowPriority: {
		type: Number,
		required: false,
		default: null
	},
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: false,
		default: "Sin descripción"
	},
	color: {
		type: String, // Código hexadecimal
		required: false,
		default: null
	},
	deletedAt: {
		type: Date,
        required: false,
		default: null
	}
}, {
	timestamps: true
});


module.exports = model('Priority', prioritySchema);
