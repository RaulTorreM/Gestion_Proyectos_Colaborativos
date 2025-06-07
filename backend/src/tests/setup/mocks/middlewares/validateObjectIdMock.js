jest.mock('../../../../middlewares/validateObjectId', () => {
    return jest.fn((model) => {
        return jest.fn((req, res, next) => {
            const { id } = req.params;
            
            // Casos específicos para testing
            if (id === 'invalid_object_id_format') {
                return res.status(400).json({ error: 'Invalid ID.' });
            }
            
            if (id === 'non_existent_id') {
                return res.status(404).json({ error: `${model.modelName || 'Document'} not found.` });
            }
            
            if (id === 'server_error_id') {
                return res.status(500).json({ error: 'Server error during validation.' });
            }
            
            // Para IDs válidos, continuar con el siguiente middleware
            next();
        });
    });
});