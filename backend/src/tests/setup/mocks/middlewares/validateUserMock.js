jest.mock('../../../../middlewares/validateUser', () => ({
    validateCreateUser: [jest.fn((req, res, next) => {
        // Check if test wants to force validation error
        if (req.testForceValidationError) {
            const error = new Error('Mocked validation error');
            error.statusCode = 400;
            return next(error);
        }
        // Otherwise, pass through successfully
        next();
    })],
    validateUpdateUser: [jest.fn((req, res, next) => {
        // Check if test wants to force validation error
        if (req.testForceValidationError) {
            const error = new Error('Mocked validation error');
            error.statusCode = 400;
            return next(error);
        }
        // Otherwise, pass through successfully
        next();
    })]
}));