const { Schema, model } = require('mongoose');

const userStoriesSchema = new Schema({
  epicId: {
    type: Schema.Types.ObjectId,
    ref: 'Epics',
    required: false,      // Lo modifiqué para que no sea obligatorio, para que se pueda guardar HU/Veriones
    default: null         // ✅ Se inicializa como null
  },
  versionId: {
    type: Schema.Types.ObjectId,
    ref: 'Versions',
    required: false,
    default: null
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  description: {
    type: String,
    trim: true,
    required: true
  },
  priorityId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Priority',
    required: false
  },
  startDate: {
    type: Date,
    required: false,
    default: new Date()
  },
  endDate: {
    type: Date, 
    required: false,
    default: null
  },
  dueDate: {
    type: Date, 
    required: false,
    default: null
  },
  status: {
    type: String,
    enum: ['Pendiente', 'En Progreso', 'Completado'],
    required: false,
    default: 'Pendiente'
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: false
  }],
  authorUserId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Users' 
  },
  deletedAt: {
    type: Date,
    required: false,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: duración
userStoriesSchema.virtual('duration').get(function () {
  if (this.startDate && this.endDate) {
    const diffInTime = this.endDate.getTime() - this.startDate.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24);
    return `${diffInDays} días`;
  }
  return 'Fechas inválidas';
});

// Virtual: tiempo restante
userStoriesSchema.virtual('remainingTime').get(function () {
  if (this.endDate instanceof Date && !isNaN(this.endDate)) {
    const now = new Date();
    if (this.endDate < now) return 'Tiempo expirado';
    const diffInTime = this.endDate.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));
    return `${diffInDays} día${diffInDays === 1 ? '' : 's'}`;
  }
  return 'Fechas inválidas';
});

module.exports = model('UserStory', userStoriesSchema);
