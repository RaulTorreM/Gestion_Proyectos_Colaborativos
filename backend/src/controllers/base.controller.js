const BaseController = {
	// Elimina claves con null o undefined
	cleanUndefinedOrNull(obj) {
	  Object.keys(obj).forEach((key) => {
		if (obj[key] === null || obj[key] === undefined) {
		  delete obj[key];
		}
	  });
	  return obj;
	},
  
	// Más utilidades o helpers que uses seguido
  };
  
  module.exports = BaseController;
  