const mongoose = require('mongoose');

const validateObjectId = (model) => {
  return async (req, res, next) => {
    const { id } = req.params;

    // Primero, valida que el ID tenga el formato correcto de ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID.' });
    }

    try {
      // Verifica si el ID existe en el modelo proporcionado
      const document = await model.findById(id);
      if (!document) {
        return res.status(404).json({ error: `${model.modelName} not found.` });
      }

      // Si el documento existe, continúa con la solicitud
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Server error during validation.' });
    }
  };
};

module.exports = validateObjectId;
