jest.mock('@middlewares/validateObjectIdArray', () => {
  return jest.fn((model) => {
    return jest.fn((req, res, next) => {
      const { ids } = req.body;

      // Caso 1: No se proporciona array de IDs
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: 'Se requiere un array de IDs en el cuerpo de la solicitud' });
      }

      // Caso 2: IDs con formato inválido
      if (ids.includes('invalid_object_id_format')) {
        return res.status(400).json({ error: 'Formato de ID inválido' });
      }

      // Caso 3: IDs que no existen en la base de datos
      if (ids.includes('non_existent_id')) {
        return res.status(404).json({
          error: 'Algunos IDs no existen en la base de datos',
          nonExistentIds: ['non_existent_id']
        });
      }

      // Caso 4: Error del servidor
      if (ids.includes('server_error_id')) {
        return res.status(500).json({ error: 'Error del servidor: Simulated server error' });
      }

      // Caso exitoso: simular documentos encontrados
      req.validatedDocuments = ids.map(id => ({ _id: id, deletedAt: null }));
      next();
    });
  });
});