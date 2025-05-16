const mongoose = require('mongoose');

const TeamPerformanceSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  evaluationDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  productivityScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  collaborationScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  punctualityScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  innovationScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

// Índice para búsquedas frecuentes
TeamPerformanceSchema.index({ projectId: 1, evaluationDate: -1 });

module.exports = mongoose.model('TeamPerformance', TeamPerformanceSchema);