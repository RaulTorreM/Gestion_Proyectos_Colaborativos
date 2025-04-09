const { Schema, model } = require('mongoose');

const projectSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,  // Usa Date para las fechas en lugar de String
        required: true,
    },
    endDate: {
        type: Date,  // Usa Date para las fechas en lugar de String
        required: true,
    },
    status: {
        type: String,
        enum: ['No iniciado', 'En Progreso', 'Finalizado'],
        default: 'No iniciado',
        required: true,
    },
    teamMembers: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            role: String
        }
    ],
    projectType: String,
    authorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
});

// Calcula la duración del proyecto en días como un campo virtual
projectSchema.virtual('duration').get(function() {
    // Si las fechas de inicio y fin están correctamente definidas
    if (this.startDate && this.endDate) {
      // Calcula la diferencia en milisegundos
      const diffInTime = this.endDate.getTime() - this.startDate.getTime();
      // Convierte la diferencia de tiempo a días (milisegundos / 86400000)
      const diffInDays = diffInTime / (1000 * 3600 * 24);
      return `${diffInDays} días`;
    }
    return 'Fechas inválidas';
});

// Asegurarse de que el campo virtual se incluya en el resultado de las consultas
projectSchema.set('toJSON', {
    virtuals: true,
});

module.exports = model('Project', projectSchema);
