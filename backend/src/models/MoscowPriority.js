const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

const AutoIncrement = require('mongoose-sequence');

const moscowPrioritySchema = new Schema({
	name: {
		type: String,
		required: true,
		//enum: ['Debe tener', 'Debería incluir', 'Podría incluir', 'No se van a hacer'],
		default: 'Debe tener'
	},
	description: {
		type: String,
		required: true
	}
}, {
	timestamps: true
});

// Agregar el campo autoIncremental llamado `priorityId`
moscowPrioritySchema.plugin(AutoIncrement(mongoose), {inc_field: 'moscowPriorityId'});

module.exports = model('MoscowPriority', moscowPrioritySchema);
