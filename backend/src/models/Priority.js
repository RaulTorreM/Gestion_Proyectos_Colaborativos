const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

const AutoIncrement = require('mongoose-sequence');

const prioritySchema = new Schema({
	moscowPriority: Number,
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true
	},
	color: {
		type: String, // Código hexadecimal
		required: true,
	},
}, {
	timestamps: true
});


module.exports = model('Priority', prioritySchema);
