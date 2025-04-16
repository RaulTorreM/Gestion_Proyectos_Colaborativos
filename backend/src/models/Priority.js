const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

const AutoIncrement = require('mongoose-sequence');

const prioritySchema = new Schema({
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
	moscowPriority: Number,
}, {
	timestamps: true
});


module.exports = model('Priority', prioritySchema);
