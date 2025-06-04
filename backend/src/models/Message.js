const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Populate virtual para el remitente
messageSchema.virtual('fromUser', {
  ref: 'User',
  localField: 'from',
  foreignField: '_id',
  justOne: true
});

// Asegurar que los virtuals se incluyan en toJSON
messageSchema.set('toJSON', { virtuals: true });

module.exports = model('Message', messageSchema);