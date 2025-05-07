// middlewares/validateObjectIdArray.js
const mongoose = require('mongoose');

const validateObjectIdArray = (model) => {
  return async (req, res, next) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Se requiere un array de IDs en el cuerpo de la solicitud' });
    }

    // Convertir todos los IDs a ObjectId
    let objectIds;
    try {
      objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
    } catch (err) {
      return res.status(400).json({ error: 'Formato de ID inválido' });
    }

    try {
      const existingDocuments = await model.find({
        _id: { $in: objectIds },
        deletedAt: null
      }).lean();

      if (existingDocuments.length !== ids.length) {
        const foundIds = existingDocuments.map(doc => doc._id.toString());
        const notFoundIds = ids.filter(id => !foundIds.includes(id));
        
        return res.status(404).json({
          error: 'Algunos IDs no existen en la base de datos',
          nonExistentIds: notFoundIds
        });
      }

      req.validatedDocuments = existingDocuments;
      next();
    } catch (err) {
      console.error('Error en validación bulk:', err);
      res.status(500).json({ error: 'Error del servidor: ' + err.message });
    }
  };
};

module.exports = validateObjectIdArray;