jest.mock('../../../controllers/base.controller', () => ({
	cleanAndAssignDefaults: jest.fn((data, defaults) => {
	  const cleaned = {};
	  for (const key in data) {
		if (data[key] !== undefined) {
		  cleaned[key] = data[key] === null ? (defaults[key] ?? null) : data[key];
		}
	  }
	  return cleaned;
	})
  }));
  