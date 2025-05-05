const Priority = require('../models/Priority');

module.exports = async function seedPriorities() {
    const data = [
        {
            moscowPriority: 1,
            name: 'Debe tener',
            description: 'Estas características son absolutamente críticas para el proyecto; sin ellas, el proyecto sería un fracaso.',
            color: '#1EA185',
        },
        {
            moscowPriority: 2,
            name: 'Debería incluir',
            description: 'Estas características son importantes, pero no esenciales para el éxito inmediato del proyecto.',
            color: '#9BBB5C',
        },
        {
            moscowPriority: 3,
            name: 'Podría incluir',
            description: 'Sería bueno tener estas características; aportan valor, pero no son críticas.',
            color: '#F29B26',
        },
        {
            moscowPriority: 4,
            name: 'No se va a hacer',
            description: 'Estas características no se implementarán en este momento; podrían considerarse en el futuro.',
            color: '#BD392F',
        },
        {
            name: 'Alta',
            description: 'Requiere atención inmediata.',
            color: '#E74C3C', // Rojo
        },
        {
            name: 'Media',
            description: 'Importante, pero no crítica.',
            color: '#F39C12', // Naranja
        },
        {
            name: 'Baja',
            description: 'De baja urgencia.',
            color: '#27AE60', // Verde
        }
    ];

    try {
        const inserted = [];
        for (const item of data) {
            const doc = await Priority.create(item);
            inserted.push(doc);
        }
    } catch (error) {
        console.error('❌ Error al insertar las prioridades MoSCoW y otras:', error);
    }
};
