const MoscowPriority = require('../models/MoscowPriority');

module.exports = async function seedMoscowPriorities() {
    const moscowData = [
        {
            name: 'Debe tener',
            description: 'Estas características son absolutamente críticas para el proyecto; sin ellas, el proyecto sería un fracaso.',
            color: '#1EA185'
        },
        {
            name: 'Debería incluir',
            description: 'Estas características son importantes, pero no esenciales para el éxito inmediato del proyecto.',
            color: '#9BBB5C'
        },
        {
            name: 'Podría incluir',
            description: 'Sería bueno tener estas características; aportan valor, pero no son críticas.',
            color: '#F29B26'
        },
        {
            name: 'No se va a hacer',
            description: 'Estas características no se implementarán en este momento; podrían considerarse en el futuro.',
            color: '#BD392F'
        }
    ];

    try {
        const inserted = [];
        for (const item of moscowData) {
            const doc = await MoscowPriority.create(item);
            inserted.push(doc);
        }
    } catch (error) {
        console.error('❌ Error al insertar las prioridades MoSCoW:', error);
    }
};
