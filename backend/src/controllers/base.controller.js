const BaseController = {
	cleanAndAssignDefaults(data, defaults = {}) {
		const cleaned = {};
	  
		for (const [key, value] of Object.entries(data)) {
		  if (value !== undefined) {
			// Si está en defaults y viene null, se pone el default
			if (value === null && defaults[key] !== undefined) {
			  cleaned[key] = defaults[key];
			} else if (value !== null) {
			  cleaned[key] = value;
			}
			// Si value es null y no hay default, simplemente no lo incluye
		  }
		}
	  
		return cleaned;
	}
	  
  
	// Más utilidades o helpers que uses seguido
  };
  
  module.exports = BaseController;
  